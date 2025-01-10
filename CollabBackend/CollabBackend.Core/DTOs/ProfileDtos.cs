namespace CollabBackend.Core.DTOs;

public record UpdateProfileDto(
    string FirstName,
    string LastName,
    string Email
);

public record UpdatePasswordDto(
    string CurrentPassword,
    string NewPassword
); 