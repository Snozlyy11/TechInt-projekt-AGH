namespace KreatorQuiz.Api.Models;

public class Quiz
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? TimeLimit { get; set; }
    public bool Published { get; set; } = false;
    public string? BannerUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public ICollection<Question> Questions { get; set; } = [];
    public ICollection<QuizSubmission> Submissions { get; set; } = [];
}
