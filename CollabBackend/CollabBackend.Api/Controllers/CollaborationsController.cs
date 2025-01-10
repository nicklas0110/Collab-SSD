using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;
using CollabBackend.Infrastructure.Services;

namespace CollabBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CollaborationsController : ControllerBase
{
    private readonly ICollaborationRepository _collaborationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserService _userService;

    public CollaborationsController(
        ICollaborationRepository collaborationRepository,
        IUserRepository userRepository,
        IUserService userService)
    {
        _collaborationRepository = collaborationRepository;
        _userRepository = userRepository;
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CollaborationDto>>> GetCollaborations()
    {
        var userId = _userService.GetCurrentUserId();
        var collaborations = await _collaborationRepository.GetAllForUserAsync(userId);
        
        return collaborations.Select(c => new CollaborationDto(
            c.Id,
            c.Title,
            c.Description,
            c.Participants.Select(p => new UserDto(
                p.Id, p.Email, p.FirstName, p.LastName, p.Role, p.CreatedAt, p.UpdatedAt)).ToList(),
            new UserDto(c.CreatedBy.Id, c.CreatedBy.Email, 
                c.CreatedBy.FirstName, c.CreatedBy.LastName, 
                c.CreatedBy.Role, c.CreatedBy.CreatedAt, 
                c.CreatedBy.UpdatedAt),
            c.CreatedAt,
            c.UpdatedAt,
            c.Status
        )).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CollaborationDto>> GetCollaboration(Guid id)
    {
        var collaboration = await _collaborationRepository.GetByIdAsync(id);
        if (collaboration == null)
            return NotFound();

        return new CollaborationDto(
            collaboration.Id,
            collaboration.Title,
            collaboration.Description,
            collaboration.Participants.Select(p => new UserDto(
                p.Id, p.Email, p.FirstName, p.LastName, p.Role, p.CreatedAt, p.UpdatedAt)).ToList(),
            new UserDto(collaboration.CreatedBy.Id, collaboration.CreatedBy.Email, 
                collaboration.CreatedBy.FirstName, collaboration.CreatedBy.LastName, 
                collaboration.CreatedBy.Role, collaboration.CreatedBy.CreatedAt, 
                collaboration.CreatedBy.UpdatedAt),
            collaboration.CreatedAt,
            collaboration.UpdatedAt,
            collaboration.Status
        );
    }

    [HttpPost]
    public async Task<ActionResult<CollaborationDto>> CreateCollaboration(CreateCollaborationDto dto)
    {
        var userId = _userService.GetCurrentUserId();
        var collaboration = new Collaboration
        {
            Title = dto.Title,
            Description = dto.Description,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Status = dto.Status
        };

        var participants = await _userRepository.GetUsersByIdsAsync(dto.ParticipantIds);
        collaboration.Participants = participants.ToList();

        await _collaborationRepository.AddAsync(collaboration);

        return new CollaborationDto(
            collaboration.Id,
            collaboration.Title,
            collaboration.Description,
            collaboration.Participants.Select(p => new UserDto(
                p.Id, p.Email, p.FirstName, p.LastName, p.Role, p.CreatedAt, p.UpdatedAt)).ToList(),
            new UserDto(collaboration.CreatedBy.Id, collaboration.CreatedBy.Email, 
                collaboration.CreatedBy.FirstName, collaboration.CreatedBy.LastName, 
                collaboration.CreatedBy.Role, collaboration.CreatedBy.CreatedAt, 
                collaboration.CreatedBy.UpdatedAt),
            collaboration.CreatedAt,
            collaboration.UpdatedAt,
            collaboration.Status
        );
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CollaborationDto>> UpdateCollaboration(Guid id, UpdateCollaborationDto collaboration)
    {
        var userId = _userService.GetCurrentUserId();
        var existing = await _collaborationRepository.GetByIdAsync(id);
        
        if (existing == null)
        {
            return NotFound();
        }

        if (existing.CreatedById != userId)
        {
            return Forbid();
        }

        existing.Title = collaboration.Title;
        existing.Description = collaboration.Description;
        existing.Status = collaboration.Status;
        existing.UpdatedAt = DateTime.UtcNow;

        await _collaborationRepository.UpdateAsync(existing);

        // Create a simplified DTO that doesn't include sensitive user data
        var participantDtos = existing.Participants.Select(p => new UserDto(
            p.Id,
            p.Email,
            p.FirstName,
            p.LastName,
            p.Role,
            p.CreatedAt,
            p.UpdatedAt
        )).ToList();

        var createdByDto = new UserDto(
            existing.CreatedBy.Id,
            existing.CreatedBy.Email,
            existing.CreatedBy.FirstName,
            existing.CreatedBy.LastName,
            existing.CreatedBy.Role,
            existing.CreatedBy.CreatedAt,
            existing.CreatedBy.UpdatedAt
        );

        return Ok(new CollaborationDto(
            existing.Id,
            existing.Title,
            existing.Description,
            participantDtos,
            createdByDto,
            existing.CreatedAt,
            existing.UpdatedAt,
            existing.Status
        ));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCollaboration(Guid id)
    {
        var userId = _userService.GetCurrentUserId();
        var collaboration = await _collaborationRepository.GetByIdAsync(id);

        if (collaboration == null)
            return NotFound();

        if (collaboration.CreatedById != userId)
            return Forbid();

        await _collaborationRepository.DeleteAsync(id);
        return NoContent();
    }

    public class AddParticipantRequest
    {
        public Guid UserId { get; set; }
    }

    [HttpPost("{id}/participants")]
    public async Task<IActionResult> AddParticipant(Guid id, [FromBody] AddParticipantRequest request)
    {
        var currentUserId = _userService.GetCurrentUserId();
        var collaboration = await _collaborationRepository.GetByIdAsync(id);

        if (collaboration == null)
            return NotFound();

        if (collaboration.CreatedById != currentUserId)
            return Forbid();

        await _collaborationRepository.AddParticipantAsync(id, request.UserId);
        return NoContent();
    }

    [HttpDelete("{id}/participants/{userId}")]
    public async Task<IActionResult> RemoveParticipant(Guid id, Guid userId)
    {
        var currentUserId = _userService.GetCurrentUserId();
        var collaboration = await _collaborationRepository.GetByIdAsync(id);

        if (collaboration == null)
            return NotFound();

        if (collaboration.CreatedById != currentUserId)
            return Forbid();

        await _collaborationRepository.RemoveParticipantAsync(id, userId);
        return NoContent();
    }
} 