using Microsoft.EntityFrameworkCore;

using FlipIt.Server.Data;
using FlipIt.Server.DTOs;
using FlipIt.Server.Models;

namespace FlipIt.Server.Services.PersonalStats;

public class PersonalStatsService(
    FlipItDbContext db) : IPersonalStatsService
{
    private static bool IsDifficultySupported(string gameMode)
        => string.Equals(gameMode, "Classic", StringComparison.OrdinalIgnoreCase);

    public async Task<IResult> GetPersonalStatsAsync(int userId)
    {
        try
        {
            var personalBests = await db.PersonalBestScores
                .Where(p => p.UserId == userId)
                .OrderBy(p => p.GameMode)
                .ThenBy(p => p.Difficulty)
                .ToListAsync();

            var personalBestsList = personalBests.Select(pb => new PersonalBestDto(
                pb.GameMode,
                pb.Difficulty,
                pb.BestMoves,
                pb.BestTimeInSeconds,
                pb.AchievedAt,
                pb.TotalGamesPlayed,
                pb.SuccessRate
            )).ToList();

            var stats = new PersonalStatsResponse(
                userId,
                personalBestsList,
                personalBests.Sum(pb => pb.TotalGamesPlayed),
                personalBests.Any() 
                    ? personalBests.Average(pb => pb.SuccessRate) 
                    : 0
            );

            return Results.Ok(stats);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.ToString());
            return Results.Problem("Failed to fetch personal stats");
        }
    }

    public async Task<IResult> UpdatePersonalBestAsync(int userId, CreateScoreRequest request)
    {
        try
        {
            var normalizedDifficulty = IsDifficultySupported(request.GameMode)
                ? request.Difficulty
                : null;

            var existingBest = await db.PersonalBestScores
                .FirstOrDefaultAsync(pb => 
                    pb.UserId == userId && 
                    pb.GameMode == request.GameMode && 
                    pb.Difficulty == normalizedDifficulty);

            var isNewBest = false;
            var isNewRecord = false;

            if (existingBest == null)
            {
                var newPersonalBest = new PersonalBestScore
                {
                    UserId = userId,
                    GameMode = request.GameMode,
                    Difficulty = normalizedDifficulty,
                    BestMoves = request.Moves,
                    BestTimeInSeconds = request.TimeInSeconds,
                    AchievedAt = DateTime.UtcNow,
                    TotalGamesPlayed = 1,
                    SuccessRate = 100.0m
                };

                db.PersonalBestScores.Add(newPersonalBest);
                isNewRecord = true;
            }
            else
            {
                var isBetterMoves = request.Moves < existingBest.BestMoves;
                var isBetterTime = request.TimeInSeconds < existingBest.BestTimeInSeconds;
                
                // Consider it a new best if either moves OR time is better
                if (isBetterMoves || isBetterTime)
                {
                    existingBest.BestMoves = Math.Min(existingBest.BestMoves, request.Moves);
                    existingBest.BestTimeInSeconds = Math.Min(existingBest.BestTimeInSeconds, request.TimeInSeconds);
                    existingBest.AchievedAt = DateTime.UtcNow;
                    isNewBest = true;
                }

                existingBest.TotalGamesPlayed++;
                
                // Calculate success rate:
                // (assume all completed games are "successful")
                existingBest.SuccessRate = 100.0m;
            }

            await db.SaveChangesAsync();

            return Results.Ok(new PersonalBestUpdateResponse(
                isNewBest,
                isNewRecord,
                isNewRecord ? "First game completed!" : 
                         isNewBest ? "New personal best!" : 
                         "Good game!"
            ));
        }
        catch (Exception e)
        {
            Console.WriteLine(e.ToString());
            return Results.Problem("Failed to update personal best");
        }
    }

    public async Task<IResult> GetPersonalBestAsync(int userId, string gameMode, string? difficulty = null)
    {
        try
        {
            var normalizedDifficulty = IsDifficultySupported(gameMode)
                ? difficulty
                : null;

            var personalBest = await db.PersonalBestScores
                .FirstOrDefaultAsync(pb => 
                    pb.UserId == userId && 
                    pb.GameMode == gameMode && 
                    pb.Difficulty == normalizedDifficulty);

            if (personalBest == null)
            {
                return Results.NotFound("No personal best found for this game mode");
            }

            return Results.Ok(new PersonalBestDto(
                personalBest.GameMode,
                personalBest.Difficulty,
                personalBest.BestMoves,
                personalBest.BestTimeInSeconds,
                personalBest.AchievedAt,
                personalBest.TotalGamesPlayed,
                personalBest.SuccessRate
            ));
        }
        catch (Exception e)
        {
            Console.WriteLine(e.ToString());
            return Results.Problem("Failed to fetch personal best");
        }
    }
}
