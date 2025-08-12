using System.Security.Claims;

using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;

using FlipIt.Server.Data;
using FlipIt.Server.DTOs;
using FlipIt.Server.Models;
using FlipIt.Server.Options;
using FlipIt.Server.Services;
using FlipIt.Server.Extensions;

var builder = WebApplication.CreateBuilder(args);

var appOrigin = builder.Configuration.GetValue<string>("ClientOrigins:FlipIt");
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<FlipItDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration
        .GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors(cfg =>
{
    if (appOrigin != null)
    {
        cfg.AddPolicy("AllowClient", policyBld =>
        {
            policyBld
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins(appOrigin);
        });
    }
});

builder.Services.AddJwtAuthentication(jwtOptions);
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<FlipItDbContext>();
    db.Database.Migrate();
}

app.UseCors("AllowClient");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/auth/register",
    async (RegisterRequest request, FlipItDbContext db, IPasswordHasher passwordHasher) =>
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email))
        {
            return Results.Conflict("Email already registered");
        }

        var (hash, salt) = passwordHasher.HashPassword(request.Password);
        var user = new User
        {
            Email = email,
            PasswordSalt = salt,
            PasswordHash = hash
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Results.Created($"/users/{user.Id}", new { user.Id, user.Email });
    }).WithTags("Auth");

app.MapPost("/auth/login", async (LoginRequest request, FlipItDbContext db, HttpResponse http, ITokenService tokenService, IOptions<JwtOptions> jwtOptions, IPasswordHasher passwordHasher) =>
{
    var email = request.Email.Trim().ToLowerInvariant();
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

    if (user == null)
    {
        return Results.Unauthorized();
    }

    if (!passwordHasher.VerifyPassword(request.Password, user.PasswordHash, user.PasswordSalt))
    {
        return Results.Unauthorized();
    }

    var (accessToken, expiryTime) = tokenService.CreateAccessToken(user);

    var (refreshToken, refreshExpiryTime) = tokenService.CreateRefreshToken();
    user.RefreshToken = refreshToken;
    user.RefreshTokenExpiresAt = refreshExpiryTime;

    await db.SaveChangesAsync();

    var response = new AuthResponse(user.Id, user.Email, accessToken, expiryTime);
    var cookieOptions = new CookieOptions
    {
        HttpOnly = true,
        Secure = jwtOptions.Value.CookieSecure,
        SameSite = SameSiteMode.None,
        Expires = user.RefreshTokenExpiresAt
    };

    http.Cookies.Append("refreshToken", refreshToken, cookieOptions);

    return Results.Ok(response);
}).WithTags("Auth");

app.MapPost("/auth/refresh", async (HttpRequest http, FlipItDbContext db, ITokenService tokenService) =>
{
    if (!http.Cookies.TryGetValue("refreshToken", out var refreshToken))
    {
        return Results.Unauthorized();
    }

    var user = await db.Users
        .FirstOrDefaultAsync(u =>
            u.RefreshToken == refreshToken &&
            u.RefreshTokenExpiresAt > DateTime.UtcNow);

    if (user == null)
    {
        return Results.Unauthorized();
    }

    var (accessToken, expiryTime) = tokenService.CreateAccessToken(user);

    return Results.Ok(new AuthResponse(user.Id, user.Email, accessToken, expiryTime));
}).WithTags("Auth");

app.MapPost("/auth/logout", async (HttpResponse http, FlipItDbContext db, ClaimsPrincipal userPrincipal) =>
{
    var userIdStr = userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
    if (int.TryParse(userIdStr, out var userId))
    {
        var user = await db.Users.FindAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiresAt = null;
            await db.SaveChangesAsync();
        }
    }
    http.Cookies.Delete("refreshToken", new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.None
    });
    return Results.Ok();
}).WithTags("Auth");

app.MapGet("/me", (ClaimsPrincipal user) =>
{
    if (user.Identity?.IsAuthenticated == true)
    {
        return Results.Ok(new
        {
            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier),
            Email = user.FindFirstValue(ClaimTypes.Email)
        });
    }

    return Results.Unauthorized();
}).RequireAuthorization();

app.MapPost("/score", async (CreateScoreRequest request, FlipItDbContext db, ClaimsPrincipal userPrincipal) =>
{
    var score = new Score
    {
        PlayerName = request.PlayerName,
        Moves = request.Moves,
        TimeInSeconds = request.TimeInSeconds,
        Difficulty = request.Difficulty,
        GameMode = request.GameMode,
        UserId = int.TryParse(userPrincipal
            .FindFirstValue(ClaimTypes.NameIdentifier), out var uid)
            ? uid
            : null
    };

    db.Scores.Add(score);
    await db.SaveChangesAsync();

    var response = new ScoreResponse(
        score.Id,
        score.PlayerName,
        score.Moves,
        score.TimeInSeconds,
        score.CreatedAt,
        score.Difficulty,
        score.GameMode
    );

    return Results.Created($"/score/{score.Id}", response);
}).AllowAnonymous();

app.MapGet("/leaderboard", async (FlipItDbContext db,
    string? difficulty = null, string? gameMode = null, int limit = 10) =>
{
    var query = db.Scores.AsQueryable();

    if (!string.IsNullOrEmpty(difficulty))
    {
        query = query.Where(s => s.Difficulty == difficulty);
    }

    if (!string.IsNullOrEmpty(gameMode))
    {
        query = query.Where(s => s.GameMode == gameMode);
    }

    var topScores = await query
        .OrderBy(s => s.Moves)
        .ThenBy(s => s.TimeInSeconds)
        .Take(limit)
        .Select(s => new ScoreResponse(
            s.Id,
            s.PlayerName,
            s.Moves,
            s.TimeInSeconds,
            s.CreatedAt,
            s.Difficulty,
            s.GameMode
        ))
        .ToListAsync();

    var totalScores = await query.CountAsync();

    var response = new LeaderboardResponse(topScores, totalScores);
    return Results.Ok(response);
});

app.Run();
