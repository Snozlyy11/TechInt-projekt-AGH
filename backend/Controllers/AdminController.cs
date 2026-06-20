using KreatorQuiz.Api.Data;
using KreatorQuiz.Api.DTOs.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KreatorQuiz.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await db.Users
            .Include(u => u.Quizzes)
                .ThenInclude(q => q.Questions)
            .OrderBy(u => u.CreatedAt)
            .Select(u => new AdminUserDto(
                u.Id,
                u.Name,
                u.Email,
                u.Role,
                u.CreatedAt,
                u.Quizzes
                    .OrderByDescending(q => q.CreatedAt)
                    .Select(q => new AdminQuizDto(
                        q.Id,
                        q.Title,
                        q.Published,
                        q.Questions.Count,
                        q.CreatedAt
                    ))
                    .ToList()
            ))
            .ToListAsync();

        return Ok(users);
    }

    [HttpDelete("quizzes/{id}")]
    public async Task<IActionResult> DeleteQuiz(int id)
    {
        var quiz = await db.Quizzes.FindAsync(id);
        if (quiz is null) return NotFound();
        db.Quizzes.Remove(quiz);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
