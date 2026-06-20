using System.Security.Claims;
using KreatorQuiz.Api.DTOs.Session;
using KreatorQuiz.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KreatorQuiz.Api.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController(SessionService sessions) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(CreateSessionRequest req)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var result = await sessions.CreateAsync(req.QuizId, UserId, "http://localhost:5173");
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> Get(string code)
    {
        var (info, quiz) = await sessions.GetSessionAsync(code.ToUpper());
        return info is null ? NotFound(new { message = "Sesja nie istnieje." }) : Ok(new { info, quiz });
    }

    [HttpPost("{code}/submit")]
    public async Task<IActionResult> Submit(string code, JoinSessionRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { message = "Podaj swoje imię." });

        var result = await sessions.SubmitAsync(code.ToUpper(), req);
        return result is null
            ? NotFound(new { message = "Sesja nie istnieje lub jest zamknięta." })
            : Ok(result);
    }

    [HttpGet("{code}/results")]
    public async Task<IActionResult> Results(string code)
    {
        var results = await sessions.GetResultsAsync(code.ToUpper());
        return Ok(results);
    }

    [Authorize]
    [HttpDelete("{code}")]
    public async Task<IActionResult> Close(string code)
    {
        var ok = await sessions.CloseAsync(code.ToUpper(), UserId);
        return ok ? NoContent() : NotFound();
    }
}
