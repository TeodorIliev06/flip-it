using System.Security.Claims;

using FlipIt.Server.DTOs;
using FlipIt.Server.Services.Leaderboard;

namespace FlipIt.Server.Extensions;

public static class ScoreEndpointsExtensions
{
    public static IEndpointRouteBuilder MapScoreEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/score", async (CreateScoreRequest request, ILeaderboardService leaderboardService, ClaimsPrincipal userPrincipal) =>
        {
            return await leaderboardService.CreateScoreAsync(request, userPrincipal);
        }).AllowAnonymous();
        return app;
    }
}
