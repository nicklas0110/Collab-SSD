namespace CollabBackend.Core.Interfaces;

using CollabBackend.Core.Entities;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(Guid id);
    Task<List<User>> GetUsersByIdsAsync(List<Guid> userIds);
    Task<List<User>> GetAllAsync();
} 