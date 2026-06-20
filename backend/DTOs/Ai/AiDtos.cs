namespace KreatorQuiz.Api.DTOs.Ai;

public record GenerateRequest(string? Text, int Count = 5, string Difficulty = "medium", string QuestionType = "single");

public record GeneratedOptionDto(string Label, string Text, bool Correct);

public record GeneratedQuestionDto(
    string Text,
    string Type,
    List<GeneratedOptionDto> Options
);

public record GenerateResponse(List<GeneratedQuestionDto> Questions);

public record RegenerateRequest(string QuestionText, string Difficulty = "medium", string QuestionType = "single", string? Context = null);
