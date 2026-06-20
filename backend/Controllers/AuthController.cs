using System.Security.Claims;
using KreatorQuiz.Api.DTOs.Auth;
using KreatorQuiz.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KreatorQuiz.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService auth) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var result = await auth.LoginAsync(req);
        if (result is null)
            return Unauthorized(new { message = "Nieprawidłowy email lub hasło." });
        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var (result, error) = await auth.RegisterAsync(req);
        if (error is not null)
            return Conflict(new { message = error });
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await auth.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(user);
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest req)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var error = await auth.ChangePasswordAsync(id, req);
        return error is null ? NoContent() : BadRequest(new { message = error });
    }

    [Authorize]
    [HttpPut("change-email")]
    public async Task<IActionResult> ChangeEmail(ChangeEmailRequest req)
    {
        var id = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var error = await auth.ChangeEmailAsync(id, req);
        return error is null ? NoContent() : BadRequest(new { message = error });
    }
}
