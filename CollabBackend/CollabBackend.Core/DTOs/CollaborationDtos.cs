using System;
using System.Collections.Generic;

namespace CollabBackend.Core.DTOs;

public record CreateCollaborationDto(
    string Title,
    string Description,
    List<Guid> ParticipantIds,
    string Status = "active"
);

public record CollaborationDto(
    Guid Id,
    string Title,
    string Description,
    List<UserDto> Participants,
    UserDto CreatedBy,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string Status
); 

public class UpdateCollaborationDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}