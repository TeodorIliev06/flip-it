using System.Security.Claims;

using FlipIt.Server.Data;
using FlipIt.Server.DTOs;
using FlipIt.Server.Models;

namespace FlipIt.Server.Extensions;

public static class ScoreEndpointsExtensions
{
    public static IEndpointRouteBuilder MapScoreEndpoints(this IEndpointRouteBuilder app)
    {
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
        return app;
    }
}
