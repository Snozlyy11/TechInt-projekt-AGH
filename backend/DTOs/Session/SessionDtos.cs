namespace KreatorQuiz.Api.DTOs.Session;

public record CreateSessionRequest(int QuizId);

public record CreateSessionResponse(string Code, string JoinUrl);

public record ParticipantResultDto(string Name, int Score, int Total, double Percent, DateTime FinishedAt);

public record SessionInfoDto(string Code, string QuizTitle, bool IsActive, int ParticipantCount);

public record JoinSessionRequest(string Name, Dictionary<string, List<string>> Answers);
