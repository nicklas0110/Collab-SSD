using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;

namespace CollabBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageRepository _messageRepository;
    private readonly ICollaborationRepository _collaborationRepository;
    private readonly IUserService _userService;

    public MessagesController(
        IMessageRepository messageRepository,
        ICollaborationRepository collaborationRepository,
        IUserService userService)
    {
        _messageRepository = messageRepository;
        _collaborationRepository = collaborationRepository;
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetAllMessages()
    {
        var userId = _userService.GetCurrentUserId();
        var messages = await _messageRepository.GetAllForUserAsync(userId);
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

    [HttpGet("collaboration/{collaborationId}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetCollaborationMessages(Guid collaborationId)
    {
        var userId = _userService.GetCurrentUserId();
        if (!await _collaborationRepository.IsUserParticipantAsync(collaborationId, userId))
            return Forbid();

        var messages = await _messageRepository.GetByCollaborationIdAsync(collaborationId);
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
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto dto)
    {
        var userId = _userService.GetCurrentUserId();
        
        if (!await _collaborationRepository.IsUserParticipantAsync(dto.CollaborationId, userId))
            return Forbid();

        var message = new Message
        {
            Content = dto.Content,
            CollaborationId = dto.CollaborationId,
            SenderId = userId,
            Read = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _messageRepository.CreateAsync(message);

        return new MessageDto(
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
        );
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

        await _messageRepository.MarkAsReadAsync(id, userId);
        return NoContent();
    }
} 