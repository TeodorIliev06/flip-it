using Microsoft.EntityFrameworkCore;

using FlipIt.Server.Data;
using FlipIt.Server.Options;
using FlipIt.Server.Services;
using FlipIt.Server.Extensions;
using FlipIt.Server.Services.Auth;
using FlipIt.Server.Services.Leaderboard;
using FlipIt.Server.Services.PersonalStats;

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
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddScoped<IPersonalStatsService, PersonalStatsService>();
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

// Register endpoints via extension methods
app.MapAuthEndpoints();
app.MapScoreEndpoints();
app.MapLeaderboardEndpoints();

app.Run();
