namespace KreatorQuiz.Api.Models;

public class QuizSession
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public int HostUserId { get; set; }
    public User Host { get; set; } = null!;

    public ICollection<SessionParticipant> Participants { get; set; } = [];
}
