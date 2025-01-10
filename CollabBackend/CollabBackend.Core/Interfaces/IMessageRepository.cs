using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CollabBackend.Core.Entities;

namespace CollabBackend.Core.Interfaces;

public interface IMessageRepository
{
    Task<IEnumerable<Message>> GetAllAsync();
    Task<Message?> GetByIdAsync(Guid id);
    Task<List<Message>> GetByCollaborationIdAsync(Guid collaborationId);
    Task<IEnumerable<Message>> GetUnreadByUserIdAsync(Guid userId);
    Task<Message> CreateAsync(Message message);
    Task<Message> UpdateAsync(Message message);
    Task DeleteAsync(Guid id);
    Task MarkAsReadAsync(Guid messageId, Guid userId);
    Task<IEnumerable<Message>> GetAllForUserAsync(Guid userId);
} 