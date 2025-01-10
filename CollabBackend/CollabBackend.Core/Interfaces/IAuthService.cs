namespace CollabBackend.Core.Interfaces;

using CollabBackend.Core.Entities;

public interface IAuthService
{
    Task<(User user, string token)> LoginAsync(string email, string password);
    Task<(User user, string token)> RegisterAsync(string email, string password, string firstName, string lastName);
    Task<bool> ValidatePasswordAsync(string password);
} 