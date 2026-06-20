using System.ComponentModel.DataAnnotations;

namespace KreatorQuiz.Api.DTOs.Quiz;

public record OptionDto(string Id, string Label, string Text, bool Correct);

public record QuestionDto(
    string Id,
    string Text,
    string Type,
    int Order,
    List<OptionDto> Options,
    int Points = 1,
    bool Required = false,
    string? ImageUrl = null
);

public record QuizDto(
    int Id,
    string Title,
    string? Description,
    int? TimeLimit,
    bool Published,
    int QuestionCount,
    DateTime CreatedAt,
    string? BannerUrl = null
);

public record QuizDetailDto(
    int Id,
    string Title,
    string? Description,
    int? TimeLimit,
    bool Published,
    List<QuestionDto> Questions,
    string? BannerUrl = null
);

public record SaveQuizRequest(
    [Required, MinLength(1)] string Title,
    string? Description,
    int? TimeLimit,
    bool Published,
    List<QuestionDto> Questions,
    string? BannerUrl = null
);

public record SubmitRequest(Dictionary<string, List<string>> Answers);

public record SubmitResult(int Score, int Total);

public record BatchQuestionsRequest(List<QuestionDto> Questions);
