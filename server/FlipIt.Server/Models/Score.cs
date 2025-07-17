namespace FlipIt.Server.Models;

public class Score
{
    public int Id { get; set; }
    public string PlayerName { get; set; }
    public int Moves { get; set; }
    public int TimeInSeconds { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Difficulty { get; set; } = "Easy";
    public string GameMode { get; set; } = "Classic";
}
