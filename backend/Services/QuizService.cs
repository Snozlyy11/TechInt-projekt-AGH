using KreatorQuiz.Api.Data;
using KreatorQuiz.Api.DTOs.Quiz;
using KreatorQuiz.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KreatorQuiz.Api.Services;

public class QuizService(AppDbContext db)
{
    public async Task<List<QuizDto>> GetAllAsync(int userId)
    {
        return await db.Quizzes
            .Where(q => q.UserId == userId)
            .OrderByDescending(q => q.UpdatedAt)
            .Select(q => new QuizDto(
                q.Id, q.Title, q.Description, q.TimeLimit,
                q.Published, q.Questions.Count, q.CreatedAt, q.BannerUrl))
            .ToListAsync();
    }

    public async Task<List<QuizDto>> GetPublicAsync()
    {
        return await db.Quizzes
            .Where(q => q.Published)
            .OrderByDescending(q => q.UpdatedAt)
            .Select(q => new QuizDto(
                q.Id, q.Title, q.Description, q.TimeLimit,
                q.Published, q.Questions.Count, q.CreatedAt, q.BannerUrl))
            .ToListAsync();
    }

    public async Task<QuizDetailDto?> GetByIdAsync(int id)
    {
        var quiz = await db.Quizzes
            .Include(q => q.Questions.OrderBy(qu => qu.Order))
            .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == id);

        return quiz is null ? null : ToDetailDto(quiz);
    }

    public async Task<QuizDto> CreateAsync(int userId, SaveQuizRequest req)
    {
        var quiz = new Quiz
        {
            Title       = req.Title,
            Description = req.Description,
            TimeLimit   = req.TimeLimit,
            Published   = req.Published,
            BannerUrl   = req.BannerUrl,
            UserId      = userId,
            Questions   = MapQuestions(req.Questions),
        };

        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();

        return new QuizDto(quiz.Id, quiz.Title, quiz.Description,
            quiz.TimeLimit, quiz.Published, quiz.Questions.Count, quiz.CreatedAt, quiz.BannerUrl);
    }

    public Task<QuizDto?> UpdateAnyAsync(int id, SaveQuizRequest req) =>
        UpdateCoreAsync(id, null, req);

    public Task<QuizDto?> UpdateAsync(int id, int userId, SaveQuizRequest req) =>
        UpdateCoreAsync(id, userId, req);

    private async Task<QuizDto?> UpdateCoreAsync(int id, int? userId, SaveQuizRequest req)
    {
        var quiz = await db.Quizzes
            .Include(q => q.Questions).ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == id && (userId == null || q.UserId == userId));

        if (quiz is null) return null;

        quiz.Title       = req.Title;
        quiz.Description = req.Description;
        quiz.TimeLimit   = req.TimeLimit;
        quiz.Published   = req.Published;
        quiz.BannerUrl   = req.BannerUrl;
        quiz.UpdatedAt   = DateTime.UtcNow;

        db.Questions.RemoveRange(quiz.Questions);
        quiz.Questions = MapQuestions(req.Questions);

        await db.SaveChangesAsync();

        return new QuizDto(quiz.Id, quiz.Title, quiz.Description,
            quiz.TimeLimit, quiz.Published, quiz.Questions.Count, quiz.CreatedAt, quiz.BannerUrl);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var quiz = await db.Quizzes.FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);
        if (quiz is null) return false;
        db.Quizzes.Remove(quiz);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<SubmitResult?> SubmitAsync(int quizId, SubmitRequest req, int? userId)
    {
        var quiz = await db.Quizzes
            .Include(q => q.Questions).ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz is null) return null;

        int score = 0, total = 0;
        foreach (var question in quiz.Questions)
        {
            total += question.Points;
            var qKey = question.Id.ToString();
            if (!req.Answers.TryGetValue(qKey, out var given)) continue;

            var correctIds = question.Options
                .Where(o => o.Correct).Select(o => o.Id.ToString()).OrderBy(x => x).ToList();
            var givenIds = given.OrderBy(x => x).ToList();

            if (correctIds.SequenceEqual(givenIds)) score += question.Points;
        }

        var submission = new QuizSubmission
        {
            QuizId      = quizId,
            UserId      = userId,
            Score       = score,
            Total       = total,
        };

        db.Submissions.Add(submission);
        await db.SaveChangesAsync();

        return new SubmitResult(score, total);
    }

    public async Task<QuizDto?> CopyAsync(int id, int userId)
    {
        var source = await db.Quizzes
            .Include(q => q.Questions).ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (source is null) return null;

        var copy = new Quiz
        {
            Title       = $"{source.Title} (kopia)",
            Description = source.Description,
            TimeLimit   = source.TimeLimit,
            BannerUrl   = source.BannerUrl,
            Published   = false,
            UserId      = userId,
            Questions   = source.Questions.OrderBy(q => q.Order).Select((q, i) => new Question
            {
                Text     = q.Text,
                Type     = q.Type,
                Order    = i,
                Points   = q.Points,
                Required = q.Required,
                ImageUrl = q.ImageUrl,
                Options  = q.Options.Select(o => new Option
                {
                    Label   = o.Label,
                    Text    = o.Text,
                    Correct = o.Correct,
                }).ToList(),
            }).ToList(),
        };

        db.Quizzes.Add(copy);
        await db.SaveChangesAsync();

        return new QuizDto(copy.Id, copy.Title, copy.Description,
            copy.TimeLimit, copy.Published, copy.Questions.Count, copy.CreatedAt, copy.BannerUrl);
    }

    public async Task AddBatchAsync(int quizId, int userId, List<QuestionDto> questions)
    {
        var quiz = await db.Quizzes
            .FirstOrDefaultAsync(q => q.Id == quizId && q.UserId == userId);
        if (quiz is null) return;

        var maxOrder = await db.Questions
            .Where(q => q.QuizId == quizId).MaxAsync(q => (int?)q.Order) ?? 0;

        var entities = questions.Select((q, i) => new Question
        {
            Text     = q.Text,
            Type     = q.Type,
            Order    = maxOrder + i + 1,
            Points   = q.Points > 0 ? q.Points : 1,
            Required = q.Required,
            ImageUrl = q.ImageUrl,
            QuizId   = quizId,
            Options  = q.Options.Select(o => new Option
            {
                Label   = o.Label,
                Text    = o.Text,
                Correct = o.Correct,
            }).ToList(),
        });

        db.Questions.AddRange(entities);
        await db.SaveChangesAsync();
    }

    private static List<Question> MapQuestions(List<QuestionDto> dtos) =>
        dtos.Select((q, i) => new Question
        {
            Text     = q.Text,
            Type     = q.Type,
            Order    = q.Order > 0 ? q.Order : i,
            Points   = q.Points > 0 ? q.Points : 1,
            Required = q.Required,
            ImageUrl = q.ImageUrl,
            Options  = q.Options.Select(o => new Option
            {
                Label   = o.Label,
                Text    = o.Text,
                Correct = o.Correct,
            }).ToList(),
        }).ToList();

    private static QuizDetailDto ToDetailDto(Quiz quiz) => new(
        quiz.Id, quiz.Title, quiz.Description, quiz.TimeLimit, quiz.Published,
        quiz.Questions.Select(q => new QuestionDto(
            q.Id.ToString(), q.Text, q.Type, q.Order,
            q.Options.Select(o => new OptionDto(o.Id.ToString(), o.Label, o.Text, o.Correct)).ToList(),
            q.Points, q.Required, q.ImageUrl
        )).ToList(),
        quiz.BannerUrl
    );
}
