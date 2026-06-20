using System.ComponentModel.DataAnnotations;

namespace KreatorQuiz.Api.DTOs.Auth;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record RegisterRequest(
    [Required, MinLength(2)] string Name,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password
);

public record AuthResponse(string Token, UserDto User);

public record UserDto(int Id, string Name, string Email, string Role);

public record ChangePasswordRequest(
    [Required] string CurrentPassword,
    [Required, MinLength(8)] string NewPassword
);

public record ChangeEmailRequest(
    [Required, EmailAddress] string NewEmail,
    [Required] string Password
);
