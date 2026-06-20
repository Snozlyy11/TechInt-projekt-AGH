using System.Security.Claims;
using KreatorQuiz.Api.DTOs.Quiz;
using KreatorQuiz.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KreatorQuiz.Api.Controllers;

[ApiController]
[Route("api/quizzes")]
public class QuizzesController(QuizService quizzes) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> List() => Ok(await quizzes.GetAllAsync(UserId));

    [HttpGet("public")]
    public async Task<IActionResult> Catalog() => Ok(await quizzes.GetPublicAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var quiz = await quizzes.GetByIdAsync(id);
        return quiz is null ? NotFound() : Ok(new { quiz = new { quiz.Id, quiz.Title, quiz.Description, quiz.TimeLimit, quiz.Published, quiz.BannerUrl }, questions = quiz.Questions });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(SaveQuizRequest req)
    {
        var result = await quizzes.CreateAsync(UserId, req);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SaveQuizRequest req)
    {
        var isAdmin = User.IsInRole("admin");
        var result = isAdmin
            ? await quizzes.UpdateAnyAsync(id, req)
            : await quizzes.UpdateAsync(id, UserId, req);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await quizzes.DeleteAsync(id, UserId);
        return ok ? NoContent() : NotFound();
    }

    [Authorize]
    [HttpPost("{id:int}/copy")]
    public async Task<IActionResult> Copy(int id)
    {
        var result = await quizzes.CopyAsync(id, UserId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:int}/submit")]
    public async Task<IActionResult> Submit(int id, SubmitRequest req)
    {
        var userId = User.Identity?.IsAuthenticated == true ? (int?)UserId : null;
        var result = await quizzes.SubmitAsync(id, req, userId);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize]
    [HttpPost("{id:int}/questions/batch")]
    public async Task<IActionResult> BatchAdd(int id, BatchQuestionsRequest req)
    {
        await quizzes.AddBatchAsync(id, UserId, req.Questions);
        return NoContent();
    }
}
