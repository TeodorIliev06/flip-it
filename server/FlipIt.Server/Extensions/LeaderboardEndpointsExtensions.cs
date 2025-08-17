using Microsoft.EntityFrameworkCore;

using FlipIt.Server.Data;
using FlipIt.Server.DTOs;

namespace FlipIt.Server.Extensions;

public static class LeaderboardEndpointsExtensions
{
    public static IEndpointRouteBuilder MapLeaderboardEndpoints(this IEndpointRouteBuilder app)
    {
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
        return app;
    }
}
