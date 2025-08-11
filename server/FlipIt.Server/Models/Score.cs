namespace FlipIt.Server.Models;

public class Score
{
    public int Id { get; set; }
    public string PlayerName { get; set; } = null!;
    public int Moves { get; set; }
    public int TimeInSeconds { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Difficulty { get; set; } = "Easy";
    public string GameMode { get; set; } = "Classic";

    // Guest scores have null UserId
    public int? UserId { get; set; }
    public User? User { get; set; }
}
