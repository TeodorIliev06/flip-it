namespace FlipIt.Server.DTOs;

public record PersonalBestDto(
    string GameMode,
    string? Difficulty,
    int BestMoves,
    int BestTimeInSeconds,
    DateTime AchievedAt,
    int TotalGamesPlayed,
    decimal SuccessRate
);

public record PersonalStatsResponse(
    int UserId,
    List<PersonalBestDto> PersonalBests,
    int TotalGamesPlayed,
    decimal OverallSuccessRate
);

public record PersonalBestUpdateResponse(
    bool IsNewBest,
    bool IsNewRecord,
    string Message
);