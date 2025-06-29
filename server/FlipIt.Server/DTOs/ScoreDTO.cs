namespace FlipIt.Server.DTOs;

public record CreateScoreRequest(
    string PlayerName,
    int Moves,
    int TimeInSeconds,
    string Difficulty = "Easy"
);

public record ScoreResponse(
    int Id,
    string PlayerName,
    int Moves,
    int TimeInSeconds,
    DateTime CreatedAt,
    string Difficulty
);

public record LeaderboardResponse(
    List<ScoreResponse> TopScores,
    int TotalScores
);
