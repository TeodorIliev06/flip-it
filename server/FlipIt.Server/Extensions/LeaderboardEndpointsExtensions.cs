using FlipIt.Server.Services.Leaderboard;

namespace FlipIt.Server.Extensions;

public static class LeaderboardEndpointsExtensions
{
    public static IEndpointRouteBuilder MapLeaderboardEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/leaderboard", async (ILeaderboardService leaderboardService, string? difficulty, string? gameMode, int limit) =>
        {
            return await leaderboardService.GetLeaderboardAsync(difficulty, gameMode, limit);
        });
        return app;
    }
}

