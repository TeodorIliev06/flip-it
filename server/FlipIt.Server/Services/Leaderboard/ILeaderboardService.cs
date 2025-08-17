using System.Security.Claims;

using FlipIt.Server.DTOs;

namespace FlipIt.Server.Services.Leaderboard;

public interface ILeaderboardService
{
    Task<IResult> CreateScoreAsync(CreateScoreRequest request, ClaimsPrincipal userPrincipal);
    Task<IResult> GetLeaderboardAsync(string? difficulty, string? gameMode, int limit);
}
