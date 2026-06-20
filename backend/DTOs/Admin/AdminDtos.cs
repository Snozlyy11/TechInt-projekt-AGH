namespace KreatorQuiz.Api.DTOs.Admin;

public record AdminQuizDto(
    int Id,
    string Title,
    bool Published,
    int QuestionCount,
    DateTime CreatedAt
);

public record AdminUserDto(
    int Id,
    string Name,
    string Email,
    string Role,
    DateTime CreatedAt,
    List<AdminQuizDto> Quizzes
);
