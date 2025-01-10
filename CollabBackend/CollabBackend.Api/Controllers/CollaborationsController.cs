using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.DTOs;
using CollabBackend.Infrastructure.Services;
using CollabBackend.Core.Services;

namespace CollabBackend.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/[controller]")]
[Authorize]
public class CollaborationsController : ControllerBase
{
    private readonly ICollaborationRepository _collaborationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUserService _userService;
    private readonly ISecurityLoggingService _securityLoggingService;

    public CollaborationsController(
        ICollaborationRepository collaborationRepository,
        IUserRepository userRepository,
        IUserService userService,
        ISecurityLoggingService securityLoggingService)
    {
        _collaborationRepository = collaborationRepository;
        _userRepository = userRepository;
        _userService = userService;
        _securityLoggingService = securityLoggingService;
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
    public async Task<ActionResult<CollaborationDto>> CreateCollaboration([FromBody] CreateCollaborationDto dto)
    {
        try
        {
            // Validate inputs
            if (!ValidationService.IsValidContent(dto.Title, maxLength: 100))
                return BadRequest(new { message = "Invalid title format or length" });

            // Changed validation for description - now optional
            if (dto.Description != null && !ValidationService.IsValidContent(dto.Description, maxLength: 500))
                return BadRequest(new { message = "Invalid description format or length" });

            // Sanitize inputs
            var sanitizedTitle = ValidationService.SanitizeInput(dto.Title);
            var sanitizedDescription = dto.Description != null ? 
                ValidationService.SanitizeInput(dto.Description) : 
                string.Empty;  // Use empty string if description is null

            var userId = _userService.GetCurrentUserId();
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                return NotFound(new { message = "User not found" });

            var collaboration = new Collaboration
            {
                Id = Guid.NewGuid(),
                Title = sanitizedTitle,
                Description = sanitizedDescription,
                CreatedById = userId,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var participants = await _userRepository.GetUsersByIdsAsync(dto.ParticipantIds);
            collaboration.Participants = participants.ToList();

            await _collaborationRepository.AddAsync(collaboration);

            _securityLoggingService.LogCollaborationAccess(
                userId, 
                collaboration.Id, 
                "create", 
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            return Ok(new CollaborationDto(
                collaboration.Id,
                collaboration.Title,
                collaboration.Description,
                collaboration.Participants.Select(p => new UserDto(
                    p.Id, p.Email, p.FirstName, p.LastName, p.Role, p.CreatedAt, p.UpdatedAt)).ToList(),
                new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.CreatedAt, user.UpdatedAt),
                collaboration.CreatedAt,
                collaboration.UpdatedAt,
                collaboration.Status
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CollaborationDto>> UpdateCollaboration(Guid id, [FromBody] UpdateCollaborationDto dto)
    {
        try
        {
            if (!ValidationService.IsValidCollaborationTitle(dto.Title))
            {
                return BadRequest(new { message = "Invalid title format or length" });
            }

            if (!ValidationService.IsValidCollaborationDescription(dto.Description))
            {
                return BadRequest(new { message = "Invalid description format or length" });
            }

            if (!ValidationService.IsValidCollaborationStatus(dto.Status))
            {
                return BadRequest(new { message = "Invalid status" });
            }

            var userId = _userService.GetCurrentUserId();
            var collaboration = await _collaborationRepository.GetByIdAsync(id);

            if (collaboration == null)
                return NotFound();

            if (collaboration.CreatedById != userId)
                return Forbid();

            collaboration.Title = ValidationService.SanitizeInput(dto.Title);
            collaboration.Description = ValidationService.SanitizeInput(dto.Description);
            collaboration.Status = dto.Status.ToLower();
            collaboration.UpdatedAt = DateTime.UtcNow;

            await _collaborationRepository.UpdateAsync(collaboration);

            _securityLoggingService.LogCollaborationAccess(
                userId,
                collaboration.Id,
                "update",
                HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            );

            // Return updated collaboration DTO
            return Ok(new CollaborationDto(
                collaboration.Id,
                collaboration.Title,
                collaboration.Description,
                collaboration.Participants.Select(p => new UserDto(
                    p.Id, p.Email, p.FirstName, p.LastName, p.Role, p.CreatedAt, p.UpdatedAt)).ToList(),
                new UserDto(
                    collaboration.CreatedBy.Id,
                    collaboration.CreatedBy.Email,
                    collaboration.CreatedBy.FirstName,
                    collaboration.CreatedBy.LastName,
                    collaboration.CreatedBy.Role,
                    collaboration.CreatedBy.CreatedAt,
                    collaboration.CreatedBy.UpdatedAt
                ),
                collaboration.CreatedAt,
                collaboration.UpdatedAt,
                collaboration.Status
            ));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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