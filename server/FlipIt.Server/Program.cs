using Microsoft.EntityFrameworkCore;

using FlipIt.Server.Data;
using FlipIt.Server.DTOs;
using FlipIt.Server.Models;

var builder = WebApplication.CreateBuilder(args);

var appOrigin = builder.Configuration.GetValue<string>("ClientOrigins:FlipIt");

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
    db.Database.EnsureCreated();
}

app.UseCors("AllowClient");

app.UseHttpsRedirection();

app.MapPost("/score", async (CreateScoreRequest request, FlipItDbContext db) =>
{
    var score = new Score
    {
        PlayerName = request.PlayerName,
        Moves = request.Moves,
        TimeInSeconds = request.TimeInSeconds,
        Difficulty = request.Difficulty
    };

    db.Scores.Add(score);
    await db.SaveChangesAsync();

    var response = new ScoreResponse(
        score.Id,
        score.PlayerName,
        score.Moves,
        score.TimeInSeconds,
        score.CreatedAt,
        score.Difficulty
    );

    return Results.Created($"/score/{score.Id}", response);
});

app.MapGet("/leaderboard", async (FlipItDbContext db, string? difficulty = null, int limit = 10) =>
{
    var query = db.Scores.AsQueryable();

    if (!string.IsNullOrEmpty(difficulty))
        query = query.Where(s => s.Difficulty == difficulty);

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
            s.Difficulty
        ))
        .ToListAsync();

    var totalScores = await query.CountAsync();

    var response = new LeaderboardResponse(topScores, totalScores);
    return Results.Ok(response);
});

app.Run();
