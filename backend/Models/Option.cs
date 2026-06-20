namespace KreatorQuiz.Api.Models;

public class Option
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool Correct { get; set; }

    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;
}
