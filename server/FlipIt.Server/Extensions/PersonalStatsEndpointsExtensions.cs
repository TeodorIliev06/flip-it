using System.Security.Claims;
using FlipIt.Server.Services.PersonalStats;
using FlipIt.Server.DTOs;

namespace FlipIt.Server.Extensions;

public static class PersonalStatsEndpointsExtensions
{
    public static IEndpointRouteBuilder MapPersonalStatsEndpoints(this IEndpointRouteBuilder app)
    {
        var personalStats = app.MapGroup("/personal-stats").WithTags("Personal Stats");

        personalStats.MapGet("/", async (IPersonalStatsService personalStatsService, ClaimsPrincipal userPrincipal) =>
        {
            var userIdClaim = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"DEBUG: User ID claim value: {userIdClaim}");
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId == 0)
            {
                return Results.BadRequest("Invalid user ID");
            }
            
            Console.WriteLine($"DEBUG: Parsed user ID: {userId}");
            return await personalStatsService.GetPersonalStatsAsync(userId);
        }).RequireAuthorization();

        personalStats.MapPost("/update-best", async (CreateScoreRequest request, IPersonalStatsService personalStatsService, ClaimsPrincipal userPrincipal) =>
        {
            var userId = int.Parse(userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            return await personalStatsService.UpdatePersonalBestAsync(userId, request);
        }).RequireAuthorization();

        personalStats.MapGet("/best/{gameMode}", async (string gameMode, string? difficulty, IPersonalStatsService personalStatsService, ClaimsPrincipal userPrincipal) =>
        {
            var userId = int.Parse(userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            return await personalStatsService.GetPersonalBestAsync(userId, gameMode, difficulty);
        }).RequireAuthorization();

        return app;
    }
}
