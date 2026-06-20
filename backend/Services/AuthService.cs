using KreatorQuiz.Api.Data;
using KreatorQuiz.Api.DTOs.Auth;
using KreatorQuiz.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KreatorQuiz.Api.Services;

public class AuthService(AppDbContext db, TokenService tokens)
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return null;

        return new AuthResponse(tokens.Generate(user), ToDto(user));
    }

    public async Task<(AuthResponse? response, string? error)> RegisterAsync(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return (null, "Ten adres email jest już zajęty.");

        var user = new User
        {
            Name         = req.Name,
            Email        = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return (new AuthResponse(tokens.Generate(user), ToDto(user)), null);
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await db.Users.FindAsync(id);
        return user is null ? null : ToDto(user);
    }

    public async Task<string?> ChangePasswordAsync(int userId, ChangePasswordRequest req)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return "Użytkownik nie istnieje.";
        if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
            return "Nieprawidłowe aktualne hasło.";
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await db.SaveChangesAsync();
        return null;
    }

    public async Task<string?> ChangeEmailAsync(int userId, ChangeEmailRequest req)
    {
        var user = await db.Users.FindAsync(userId);
        if (user is null) return "Użytkownik nie istnieje.";
        if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return "Nieprawidłowe hasło.";
        if (await db.Users.AnyAsync(u => u.Email == req.NewEmail && u.Id != userId))
            return "Ten adres email jest już zajęty.";
        user.Email = req.NewEmail;
        await db.SaveChangesAsync();
        return null;
    }

    private static UserDto ToDto(User u) => new(u.Id, u.Name, u.Email, u.Role);
}
