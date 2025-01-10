using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;
using CollabBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CollabBackend.Infrastructure.Repositories;

public class CollaborationRepository : ICollaborationRepository
{
    private readonly ApplicationDbContext _context;

    public CollaborationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Collaboration>> GetAllAsync()
    {
        return await _context.Collaborations
            .Include(c => c.CreatedBy)
            .Include(c => c.Participants)
            .ToListAsync();
    }

    public async Task<List<Collaboration>> GetAllForUserAsync(Guid userId)
    {
        return await _context.Collaborations
            .Include(c => c.CreatedBy)
            .Include(c => c.Participants)
            .Where(c => c.CreatedById == userId || c.Participants.Any(p => p.Id == userId))
            .ToListAsync();
    }

    public async Task<Collaboration?> GetByIdAsync(Guid id)
    {
        return await _context.Collaborations
            .Include(c => c.CreatedBy)
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Collaboration> AddAsync(Collaboration collaboration)
    {
        _context.Collaborations.Add(collaboration);
        await _context.SaveChangesAsync();
        return collaboration;
    }

    public async Task UpdateAsync(Collaboration collaboration)
    {
        _context.Entry(collaboration).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var collaboration = await _context.Collaborations.FindAsync(id);
        if (collaboration != null)
        {
            _context.Collaborations.Remove(collaboration);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> IsUserParticipantAsync(Guid collaborationId, Guid userId)
    {
        var collaboration = await _context.Collaborations
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == collaborationId);

        if (collaboration == null)
            return false;

        return collaboration.CreatedById == userId || 
               collaboration.Participants.Any(p => p.Id == userId);
    }

    public async Task AddParticipantAsync(Guid collaborationId, Guid userId)
    {
        var collaboration = await _context.Collaborations
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == collaborationId);
        
        var user = await _context.Users.FindAsync(userId);

        if (collaboration != null && user != null && 
            !collaboration.Participants.Any(p => p.Id == userId))
        {
            collaboration.Participants.Add(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemoveParticipantAsync(Guid collaborationId, Guid userId)
    {
        var collaboration = await _context.Collaborations
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == collaborationId);

        if (collaboration != null)
        {
            var participant = collaboration.Participants.FirstOrDefault(p => p.Id == userId);
            if (participant != null)
            {
                collaboration.Participants.Remove(participant);
                await _context.SaveChangesAsync();
            }
        }
    }

    public async Task<IEnumerable<User>> GetParticipantsAsync(Guid collaborationId)
    {
        var collaboration = await _context.Collaborations
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == collaborationId);
        
        return collaboration?.Participants ?? new List<User>();
    }
} 