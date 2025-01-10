using CollabBackend.Core.Interfaces;
using CollabBackend.Core.Entities;

namespace CollabBackend.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;

    public ProfileService(IUserRepository userRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _authService = authService;
    }

    public async Task<User> GetProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user ?? throw new KeyNotFoundException("User not found");
    }

    public async Task<User> UpdateProfileAsync(Guid userId, string firstName, string lastName, string email)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        if (email != user.Email)
        {
            var existingUser = await _userRepository.GetByEmailAsync(email);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Email already in use");
            }
        }

        user.FirstName = firstName;
        user.LastName = lastName;
        user.Email = email;
        user.UpdatedAt = DateTime.UtcNow;

        return await _userRepository.UpdateAsync(user);
    }

    public async Task UpdatePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        if (!await _authService.ValidatePasswordAsync(newPassword))
        {
            throw new ArgumentException("New password does not meet requirements");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
    }

    public async Task DeleteAccountAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return;

        // Generate a random password (64 characters)
        var randomPassword = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + 
                            Convert.ToBase64String(Guid.NewGuid().ToByteArray());

        // Anonymize user data instead of deleting
        user.FirstName = "[Deleted]";
        user.LastName = "User";
        user.Email = $"deleted_{userId}@example.com";
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(randomPassword);
        
        await _userRepository.UpdateAsync(user);
    }
} 