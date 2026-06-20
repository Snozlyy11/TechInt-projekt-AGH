namespace KreatorQuiz.Api.Models;

public class Question
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = "single";
    public int Order { get; set; }

    public int Points { get; set; } = 1;
    public bool Required { get; set; } = false;
    public string? ImageUrl { get; set; }

    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
    public ICollection<Option> Options { get; set; } = [];
}
