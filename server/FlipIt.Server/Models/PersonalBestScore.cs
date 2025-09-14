namespace FlipIt.Server.Models;

public class PersonalBestScore
{
    public int Id { get; set; }

    public string GameMode { get; set; } = null!;

    public string? Difficulty { get; set; }

    public int BestMoves { get; set; }

    public int BestTimeInSeconds { get; set; }

    public DateTime AchievedAt { get; set; }

    public int TotalGamesPlayed { get; set; }

    public decimal SuccessRate { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;
}
