using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CollabBackend.Core.Entities;

namespace CollabBackend.Core.Interfaces;

public interface ICollaborationRepository
{
    Task<List<Collaboration>> GetAllAsync();
    Task<List<Collaboration>> GetAllForUserAsync(Guid userId);
    Task<Collaboration?> GetByIdAsync(Guid id);
    Task<Collaboration> AddAsync(Collaboration collaboration);
    Task UpdateAsync(Collaboration collaboration);
    Task DeleteAsync(Guid id);
    Task<bool> IsUserParticipantAsync(Guid collaborationId, Guid userId);
    Task AddParticipantAsync(Guid collaborationId, Guid userId);
    Task RemoveParticipantAsync(Guid collaborationId, Guid userId);
}