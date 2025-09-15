using FlipIt.Server.DTOs;

namespace FlipIt.Server.Services.PersonalStats;

public interface IPersonalStatsService
{
    Task<IResult> GetPersonalStatsAsync(int userId);
    Task<IResult> UpdatePersonalBestAsync(int userId, CreateScoreRequest request);
    Task<IResult> GetPersonalBestAsync(int userId, string gameMode, string? difficulty = null);
}
