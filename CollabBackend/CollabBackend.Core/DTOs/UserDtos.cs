namespace CollabBackend.Core.DTOs;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record AuthResponseDto(
    UserDto User,
    string Token
); 