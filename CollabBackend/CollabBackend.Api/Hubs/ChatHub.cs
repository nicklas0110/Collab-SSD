using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;
using System.Security.Claims;

namespace CollabBackend.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IUserService _userService;
    private readonly IUserRepository _userRepository;
    private readonly ICollaborationRepository _collaborationRepository;
    private readonly ISecurityLoggingService _securityLoggingService;

    public ChatHub(
        IUserService userService,
        IUserRepository userRepository,
        ICollaborationRepository collaborationRepository,
        ISecurityLoggingService securityLoggingService)
    {
        _userService = userService;
        _userRepository = userRepository;
        _collaborationRepository = collaborationRepository;
        _securityLoggingService = securityLoggingService;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = _userService.GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user != null)
        {
            // Update user online status
            user.IsOnline = true;
            user.LastSeen = DateTime.UtcNow;
            await _userRepository.UpdateAsync(user);

            // Join user to their collaboration groups
            var collaborations = await _collaborationRepository.GetByUserIdAsync(userId);
            foreach (var collaboration in collaborations)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"collaboration_{collaboration.Id}");
            }

            // Join user to their personal group for direct messages
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

            // Notify others about user coming online
            await Clients.All.SendAsync("UserOnline", new { UserId = userId, IsOnline = true });
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _userService.GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);
        
        if (user != null)
        {
            // Update user offline status
            user.IsOnline = false;
            user.LastSeen = DateTime.UtcNow;
            user.IsTyping = false;
            user.TypingInCollaborationId = null;
            await _userRepository.UpdateAsync(user);

            // Notify others about user going offline
            await Clients.All.SendAsync("UserOffline", new { UserId = userId, IsOnline = false, LastSeen = user.LastSeen });
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinCollaboration(string collaborationId)
    {
        if (Guid.TryParse(collaborationId, out var collabGuid))
        {
            var userId = _userService.GetCurrentUserId();
            if (await _collaborationRepository.IsUserParticipantAsync(collabGuid, userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"collaboration_{collaborationId}");
            }
        }
    }

    public async Task LeaveCollaboration(string collaborationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"collaboration_{collaborationId}");
    }

    public async Task SendTypingIndicator(string collaborationId, bool isTyping)
    {
        if (Guid.TryParse(collaborationId, out var collabGuid))
        {
            var userId = _userService.GetCurrentUserId();
            if (await _collaborationRepository.IsUserParticipantAsync(collabGuid, userId))
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user != null)
                {
                    user.IsTyping = isTyping;
                    user.TypingInCollaborationId = isTyping ? collabGuid : null;
                    await _userRepository.UpdateAsync(user);

                    await Clients.Group($"collaboration_{collaborationId}")
                        .SendAsync("TypingIndicator", new { 
                            UserId = userId,
                            UserName = $"{user.FirstName} {user.LastName}",
                            CollaborationId = collaborationId,
                            IsTyping = isTyping 
                        });
                }
            }
        }
    }

    public async Task SendDirectTypingIndicator(string recipientId, bool isTyping)
    {
        if (Guid.TryParse(recipientId, out var recipientGuid))
        {
            var userId = _userService.GetCurrentUserId();
            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user != null)
            {
                await Clients.Group($"user_{recipientId}")
                    .SendAsync("DirectTypingIndicator", new { 
                        UserId = userId,
                        UserName = $"{user.FirstName} {user.LastName}",
                        IsTyping = isTyping 
                    });
            }
        }
    }

    public async Task MarkMessageAsDelivered(string messageId)
    {
        // This would be called by clients to confirm message delivery
        await Clients.All.SendAsync("MessageDelivered", new { MessageId = messageId });
    }

    public async Task MarkMessageAsRead(string messageId)
    {
        // This would be called by clients to confirm message has been read
        await Clients.All.SendAsync("MessageRead", new { MessageId = messageId });
    }
}