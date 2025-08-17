using System.Security.Claims;

using Microsoft.EntityFrameworkCore;

using FlipIt.Server.Data;
using FlipIt.Server.DTOs;
using FlipIt.Server.Models;

namespace FlipIt.Server.Services.Leaderboard;

public class LeaderboardService(FlipItDbContext db) : ILeaderboardService
{
    public async Task<IResult> CreateScoreAsync(CreateScoreRequest request, ClaimsPrincipal userPrincipal)
    {
        var score = new Score
        {
            PlayerName = request.PlayerName,
            Moves = request.Moves,
            TimeInSeconds = request.TimeInSeconds,
            Difficulty = request.Difficulty,
            GameMode = request.GameMode,
            UserId = int.TryParse(userPrincipal.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : null
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
    }

    public async Task<IResult> GetLeaderboardAsync(string? difficulty, string? gameMode, int limit)
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
    }
}
