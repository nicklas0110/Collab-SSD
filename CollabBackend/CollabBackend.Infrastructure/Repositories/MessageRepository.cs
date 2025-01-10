using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;
using CollabBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CollabBackend.Infrastructure.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly ApplicationDbContext _context;

    public MessageRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Message>> GetAllAsync()
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Collaboration)
            .ToListAsync();
    }

    public async Task<Message?> GetByIdAsync(Guid id)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Collaboration)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<List<Message>> GetByCollaborationIdAsync(Guid collaborationId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Where(m => m.CollaborationId == collaborationId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Message>> GetUnreadByUserIdAsync(Guid userId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Collaboration)
            .Where(m => m.Collaboration.Participants.Any(p => p.Id == userId) && !m.Read)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<Message> CreateAsync(Message message)
    {
        message.CreatedAt = DateTime.UtcNow;
        message.UpdatedAt = DateTime.UtcNow;
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task<Message> UpdateAsync(Message message)
    {
        message.UpdatedAt = DateTime.UtcNow;
        _context.Entry(message).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task DeleteAsync(Guid id)
    {
        var message = await _context.Messages.FindAsync(id);
        if (message != null)
        {
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAsReadAsync(Guid messageId, Guid userId)
    {
        var message = await _context.Messages
            .Include(m => m.Collaboration)
            .ThenInclude(c => c.Participants)
            .FirstOrDefaultAsync(m => m.Id == messageId);

        if (message != null && message.Collaboration.Participants.Any(p => p.Id == userId))
        {
            message.Read = true;
            message.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Message>> GetAllForUserAsync(Guid userId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Collaboration)
            .Where(m => m.Collaboration.Participants.Any(p => p.Id == userId))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();
    }
} 