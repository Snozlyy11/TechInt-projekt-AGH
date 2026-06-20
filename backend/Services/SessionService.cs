using KreatorQuiz.Api.Data;
using KreatorQuiz.Api.DTOs.Quiz;
using KreatorQuiz.Api.DTOs.Session;
using KreatorQuiz.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KreatorQuiz.Api.Services;

public class SessionService(AppDbContext db)
{
    public async Task<CreateSessionResponse?> CreateAsync(int quizId, int hostUserId, string baseUrl)
    {
        var quiz = await db.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId && q.UserId == hostUserId);
        if (quiz is null) return null;

        var code = await GenerateUniqueCodeAsync();

        var session = new QuizSession
        {
            Code        = code,
            QuizId      = quizId,
            HostUserId  = hostUserId,
        };

        db.Sessions.Add(session);
        await db.SaveChangesAsync();

        return new CreateSessionResponse(code, $"{baseUrl}/session/{code}");
    }

    public async Task<(SessionInfoDto? info, object? quiz)> GetSessionAsync(string code)
    {
        var session = await db.Sessions
            .Include(s => s.Quiz).ThenInclude(q => q.Questions).ThenInclude(q => q.Options)
            .Include(s => s.Participants)
            .FirstOrDefaultAsync(s => s.Code == code);

        if (session is null) return (null, null);

        var info = new SessionInfoDto(
            session.Code,
            session.Quiz.Title,
            session.IsActive,
            session.Participants.Count
        );

        var quiz = new
        {
            session.Quiz.Id,
            session.Quiz.Title,
            session.Quiz.Description,
            session.Quiz.TimeLimit,
            session.Quiz.BannerUrl,
            Questions = session.Quiz.Questions.OrderBy(q => q.Order).Select(q => new QuestionDto(
                q.Id.ToString(), q.Text, q.Type, q.Order,
                q.Options.Select(o => new OptionDto(o.Id.ToString(), o.Label, o.Text, false)).ToList(),
                q.Points, q.Required, q.ImageUrl
            )).ToList()
        };

        return (info, quiz);
    }

    public async Task<ParticipantResultDto?> SubmitAsync(string code, JoinSessionRequest req)
    {
        var session = await db.Sessions
            .Include(s => s.Quiz).ThenInclude(q => q.Questions).ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(s => s.Code == code && s.IsActive);

        if (session is null) return null;

        int score = 0, total = 0;
        foreach (var question in session.Quiz.Questions)
        {
            total += question.Points;
            var qKey = question.Id.ToString();
            if (!req.Answers.TryGetValue(qKey, out var given)) continue;
            var correctIds = question.Options.Where(o => o.Correct).Select(o => o.Id.ToString()).OrderBy(x => x).ToList();
            if (correctIds.SequenceEqual(given.OrderBy(x => x).ToList())) score += question.Points;
        }
        var participant = new SessionParticipant
        {
            Name      = req.Name.Trim(),
            Score     = score,
            Total     = total,
            SessionId = session.Id,
        };

        db.SessionParticipants.Add(participant);
        await db.SaveChangesAsync();

        return new ParticipantResultDto(req.Name, score, total, total > 0 ? Math.Round((double)score / total * 100, 1) : 0, participant.FinishedAt);
    }

    public async Task<List<ParticipantResultDto>> GetResultsAsync(string code)
    {
        var session = await db.Sessions
            .Include(s => s.Participants)
            .FirstOrDefaultAsync(s => s.Code == code);

        if (session is null) return [];

        return session.Participants
            .OrderByDescending(p => p.Score)
            .ThenBy(p => p.FinishedAt)
            .Select(p => new ParticipantResultDto(
                p.Name, p.Score, p.Total,
                p.Total > 0 ? Math.Round((double)p.Score / p.Total * 100, 1) : 0,
                p.FinishedAt))
            .ToList();
    }

    public async Task<bool> CloseAsync(string code, int hostUserId)
    {
        var session = await db.Sessions.FirstOrDefaultAsync(s => s.Code == code && s.HostUserId == hostUserId);
        if (session is null) return false;
        session.IsActive = false;
        await db.SaveChangesAsync();
        return true;
    }

    private async Task<string> GenerateUniqueCodeAsync()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var rng = Random.Shared;
        string code;
        do
        {
            code = new string(Enumerable.Range(0, 6).Select(_ => chars[rng.Next(chars.Length)]).ToArray());
        } while (await db.Sessions.AnyAsync(s => s.Code == code));
        return code;
    }
}
