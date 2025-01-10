using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;
using CollabBackend.Core.Services;

namespace CollabBackend.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageRepository _messageRepository;
    private readonly ICollaborationRepository _collaborationRepository;
    private readonly IUserService _userService;
    private readonly ISecurityLoggingService _securityLoggingService;
    private readonly IUserRepository _userRepository;
    private readonly IMessageService _messageService;

    public MessagesController(
        IMessageRepository messageRepository,
        ICollaborationRepository collaborationRepository,
        IUserService userService,
        ISecurityLoggingService securityLoggingService,
        IUserRepository userRepository,
        IMessageService messageService)
    {
        _messageRepository = messageRepository;
        _collaborationRepository = collaborationRepository;
        _userService = userService;
        _securityLoggingService = securityLoggingService;
        _userRepository = userRepository;
        _messageService = messageService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetAllMessages()
    {
        var userId = _userService.GetCurrentUserId();
        var messages = await _messageRepository.GetAllForUserAsync(userId);
        var dtos = messages.Select(m => new MessageDto(
            m.Id,
            _messageService.DecryptMessageContent(m.Content),
            m.SenderId,
            new UserDto(
                m.Sender.Id,
                m.Sender.Email,
                m.Sender.FirstName,
                m.Sender.LastName,
                m.Sender.Role,
                m.Sender.CreatedAt,
                m.Sender.UpdatedAt
            ),
            m.CollaborationId,
            m.Read,
            m.CreatedAt,
            m.UpdatedAt
        ));
        return Ok(dtos);
    }

    [HttpGet("collaboration/{collaborationId}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetCollaborationMessages(Guid collaborationId)
    {
        try
        {
            var userId = _userService.GetCurrentUserId();
            if (!await _collaborationRepository.IsUserParticipantAsync(collaborationId, userId))
                return Forbid();

            var messages = await _messageRepository.GetByCollaborationIdAsync(collaborationId);
            var dtos = messages.Select(m => new MessageDto(
                m.Id,
                _messageService.DecryptMessageContent(m.Content),
                m.SenderId,
                new UserDto(
                    m.Sender.Id,
                    m.Sender.Email,
                    m.Sender.FirstName,
                    m.Sender.LastName,
                    m.Sender.Role,
                    m.Sender.CreatedAt,
                    m.Sender.UpdatedAt
                ),
                m.CollaborationId,
                m.Read,
                m.CreatedAt,
                m.UpdatedAt
            )).ToList();
            
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error processing messages", details = ex.Message });
        }
    }

    [HttpGet("unread")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetUnreadMessages()
    {
        var userId = _userService.GetCurrentUserId();
        var messages = await _messageRepository.GetUnreadByUserIdAsync(userId);
        var dtos = messages.Select(m => new MessageDto(
            m.Id,
            m.Content,
            m.SenderId,
            new UserDto(
                m.Sender.Id,
                m.Sender.Email,
                m.Sender.FirstName,
                m.Sender.LastName,
                m.Sender.Role,
                m.Sender.CreatedAt,
                m.Sender.UpdatedAt
            ),
            m.CollaborationId,
            m.Read,
            m.CreatedAt,
            m.UpdatedAt
        ));
        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage([FromBody] CreateMessageDto dto)
    {
        try
        {
            if (!ValidationService.IsValidMessageContent(dto.Content))
            {
                return BadRequest(new { message = "Invalid message content..." });
            }

            var userId = _userService.GetCurrentUserId();
            var user = await _userRepository.GetByIdAsync(userId);
            
            if (user == null)
                return NotFound(new { message = "User not found" });

            var sanitizedContent = ValidationService.SanitizeInput(dto.Content);
            var encryptedContent = _messageService.EncryptMessageContent(sanitizedContent);

            var message = new Message
            {
                Id = Guid.NewGuid(),
                Content = encryptedContent,
                SenderId = userId,
                CollaborationId = dto.CollaborationId,
                Read = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _messageRepository.CreateAsync(message);
            
            _securityLoggingService.LogSecurityEvent(
                "MessageCreated",
                $"Message created in collaboration {dto.CollaborationId}",
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                LogLevel.Information
            );

            return Ok(new MessageDto(
                message.Id,
                _messageService.DecryptMessageContent(message.Content),
                message.SenderId,
                new UserDto(
                    user.Id,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.Role,
                    user.CreatedAt,
                    user.UpdatedAt
                ),
                message.CollaborationId,
                message.Read,
                message.CreatedAt,
                message.UpdatedAt
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MessageDto>> UpdateMessage(Guid id, [FromBody] UpdateMessageDto dto)
    {
        try
        {
            if (!ValidationService.IsValidMessageContent(dto.Content))
            {
                return BadRequest(new { message = "Invalid message content. Message must be between 1 and 2000 characters and not contain dangerous content." });
            }

            var userId = _userService.GetCurrentUserId();
            var message = await _messageRepository.GetByIdAsync(id);

            if (message == null)
                return NotFound(new { message = "Message not found" });

            if (message.SenderId != userId)
                return Forbid();

            message.Content = ValidationService.SanitizeInput(dto.Content);
            message.UpdatedAt = DateTime.UtcNow;

            await _messageRepository.UpdateAsync(message);

            _securityLoggingService.LogSecurityEvent(
                "MessageUpdated",
                $"Message {id} updated",
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                LogLevel.Information
            );

            return Ok(new MessageDto(
                message.Id,
                message.Content,
                message.SenderId,
                new UserDto(
                    message.Sender.Id,
                    message.Sender.Email,
                    message.Sender.FirstName,
                    message.Sender.LastName,
                    message.Sender.Role,
                    message.Sender.CreatedAt,
                    message.Sender.UpdatedAt
                ),
                message.CollaborationId,
                message.Read,
                message.CreatedAt,
                message.UpdatedAt
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = _userService.GetCurrentUserId();
        var message = await _messageRepository.GetByIdAsync(id);
        
        if (message == null)
            return NotFound();

        if (!await _collaborationRepository.IsUserParticipantAsync(message.CollaborationId, userId))
            return Forbid();

        message.Read = true;
        message.UpdatedAt = DateTime.UtcNow;
        
        await _messageRepository.UpdateAsync(message);
        return NoContent();
    }
} 