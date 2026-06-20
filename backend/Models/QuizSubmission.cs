namespace KreatorQuiz.Api.Models;

public class QuizSubmission
{
    public int Id { get; set; }
    public int Score { get; set; }
    public int Total { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public int? UserId { get; set; }
    public User? User { get; set; }
}
