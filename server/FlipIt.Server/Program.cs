using System.Security.Claims;

using Google.Apis.Auth;
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

app.Use(async (context, next) =>
{
    // CSP for Google Identity Services and GitHub OAuth
    context.Response.Headers.Append("Content-Security-Policy",
        "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; " +
        "frame-src 'self' https://accounts.google.com; " +
        "connect-src 'self' https://accounts.google.com https://api.github.com https://github.com https://localhost:7299");

    await next();
});

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

app.MapPost("/auth/google", async (
    GoogleAuthRequest request,
    FlipItDbContext db,
    ITokenService tokenService,
    IOptions<JwtOptions> jwtOptions,
    HttpResponse http,
    IConfiguration config) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return Results.BadRequest("Missing idToken");
        }

        var clientId = config.GetValue<string>("Google:ClientId");

        if (string.IsNullOrWhiteSpace(clientId))
        {
            return Results.Problem("Server Google ClientId is not configured");
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Google token validation failed: {ex.Message}");
            return Results.Unauthorized();
        }

        var email = (payload.Email ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(email))
        {
            Console.WriteLine("No email in token payload");
            return Results.Unauthorized();
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new User
            {
                Email = email,
                PasswordHash = string.Empty,
                PasswordSalt = string.Empty
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }

        var (accessToken, accessExpires) = tokenService.CreateAccessToken(user);
        var (refreshToken, refreshExpires) = tokenService.CreateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = refreshExpires;
        await db.SaveChangesAsync();

        http.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = jwtOptions.Value.CookieSecure,
            SameSite = SameSiteMode.None,
            Expires = refreshExpires
        });

        return Results.Ok(new AuthResponse(user.Id, user.Email, accessToken, accessExpires));
    }
    catch (Exception e)
    {
        Console.WriteLine(e.ToString());
        throw;
    }
}).WithTags("Auth");

app.MapPost("/auth/github", async (
    GitHubAuthRequest request,
    FlipItDbContext db,
    ITokenService tokenService,
    IOptions<JwtOptions> jwtOptions,
    HttpResponse http,
    IConfiguration config,
    HttpContext context) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return Results.BadRequest("Missing authorization code");
        }

        var clientId = config.GetValue<string>("GitHub:ClientId");
        var clientSecret = config.GetValue<string>("GitHub:ClientSecret");

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
        {
            return Results.Problem("GitHub OAuth not configured");
        }

        // Step 1: Exchange code for access token
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
        httpClient.DefaultRequestHeaders.Add("User-Agent", "FlipIt-App");

        var redirectUri = appOrigin;

        // GitHub expects form-encoded data, not JSON
        var formData = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("client_id", clientId),
            new KeyValuePair<string, string>("client_secret", clientSecret),
            new KeyValuePair<string, string>("code", request.Code),
            new KeyValuePair<string, string>("redirect_uri", redirectUri!)
        });

        var tokenResponse = await httpClient
            .PostAsync("https://github.com/login/oauth/access_token", formData);

        if (!tokenResponse.IsSuccessStatusCode)
        {
            return Results.Problem("Failed to get access token from GitHub");
        }

        var tokenData = await tokenResponse.Content
            .ReadFromJsonAsync<GitHubAccessTokenResponse>();

        if (tokenData?.AccessToken == null)
        {
            return Results.Problem($"GitHub OAuth failed: {tokenData?.Error ?? "Unknown error"}");
        }

        // Step 2: Get user info
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenData.AccessToken);

        var userResponse = await httpClient.GetAsync("https://api.github.com/user");
        if (!userResponse.IsSuccessStatusCode)
        {
            return Results.Problem("Failed to get user info from GitHub");
        }

        var userInfo = await userResponse.Content.ReadFromJsonAsync<GitHubUserInfo>();
        string? githubEmail = userInfo?.Email;

        // If email is null, try to get it from the emails endpoint
        if (string.IsNullOrEmpty(githubEmail))
        {
            Console.WriteLine("Email not found in user info, trying emails endpoint...");
            var emailsResponse = await httpClient.GetAsync("https://api.github.com/user/emails");
            if (emailsResponse.IsSuccessStatusCode)
            {
                var emails = await emailsResponse.Content.ReadFromJsonAsync<GitHubEmail[]>();
                githubEmail = emails?.FirstOrDefault(e => e.Primary)?.Email;
                Console.WriteLine($"Found email from emails endpoint: {githubEmail}");
            }
        }

        if (string.IsNullOrEmpty(githubEmail))
        {
            return Results.Problem("No email found in GitHub user info. GitHub users can have private emails.");
        }

        // Step 3: Find or create user
        var email = githubEmail.Trim().ToLowerInvariant();

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            user = new User
            {
                Email = email,
                PasswordHash = string.Empty,
                PasswordSalt = string.Empty
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }

        // Step 4: Create JWT tokens
        var (accessToken, accessExpires) = tokenService.CreateAccessToken(user);
        var (refreshToken, refreshExpires) = tokenService.CreateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = refreshExpires;
        await db.SaveChangesAsync();

        http.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = jwtOptions.Value.CookieSecure,
            SameSite = SameSiteMode.None,
            Expires = refreshExpires
        });

        return Results.Ok(new AuthResponse(user.Id, user.Email, accessToken, accessExpires));
    }
    catch (Exception e)
    {
        Console.WriteLine($"GitHub auth error: {e}");
        throw;
    }
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
