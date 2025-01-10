namespace CollabBackend.Core.Interfaces;

using CollabBackend.Core.Entities;

public interface IProfileService
{
    Task<User> GetProfileAsync(Guid userId);
    Task<User> UpdateProfileAsync(Guid userId, string firstName, string lastName, string email);
    Task UpdatePasswordAsync(Guid userId, string currentPassword, string newPassword);
    Task DeleteAccountAsync(Guid userId);
} 