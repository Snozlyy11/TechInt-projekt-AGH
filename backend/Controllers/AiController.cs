using KreatorQuiz.Api.DTOs.Ai;
using KreatorQuiz.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KreatorQuiz.Api.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AiController(AiService ai, PdfService pdf) : ControllerBase
{
    [HttpPost("generate")]
    public async Task<IActionResult> Generate(
        [FromForm] int count = 5,
        [FromForm] string? text = null,
        [FromForm] List<IFormFile>? files = null,
        [FromForm] string difficulty = "medium",
        [FromForm] string questionType = "single")
    {
        var parts = new List<string>();

        if (files is { Count: > 0 })
        {
            if (files.Count > 5)
                return BadRequest(new { message = "Maksymalnie 5 plików PDF." });

            foreach (var file in files)
            {
                using var stream = file.OpenReadStream();
                var extracted = pdf.ExtractText(stream);
                if (!string.IsNullOrWhiteSpace(extracted))
                    parts.Add(extracted);
            }
        }

        if (!string.IsNullOrWhiteSpace(text))
            parts.Add(text.Trim());

        if (parts.Count == 0)
            return BadRequest(new { message = "Podaj tekst lub prześlij co najmniej jeden plik PDF." });

        var sourceText = string.Join("\n\n---\n\n", parts);

        if (sourceText.Length < 50)
            return BadRequest(new { message = "Tekst jest za krótki do wygenerowania pytań." });

        var questions = await ai.GenerateAsync(sourceText, Math.Clamp(count, 1, 20), difficulty, questionType);
        return Ok(new GenerateResponse(questions));
    }

    [HttpPost("regenerate")]
    public async Task<IActionResult> Regenerate([FromBody] RegenerateRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.QuestionText))
            return BadRequest(new { message = "Podaj treść pytania do regeneracji." });

        var question = await ai.RegenerateOneAsync(req.QuestionText, req.Difficulty, req.QuestionType, req.Context);
        return question is null ? StatusCode(500, new { message = "Nie udało się wygenerować pytania." }) : Ok(question);
    }
}
