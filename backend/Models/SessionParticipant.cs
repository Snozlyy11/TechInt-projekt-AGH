namespace KreatorQuiz.Api.Models;

public class SessionParticipant
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; }
    public int Total { get; set; }
    public DateTime FinishedAt { get; set; } = DateTime.UtcNow;

    public int SessionId { get; set; }
    public QuizSession Session { get; set; } = null!;
}
