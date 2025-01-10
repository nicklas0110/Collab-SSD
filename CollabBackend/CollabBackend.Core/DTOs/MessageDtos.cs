using System;

namespace CollabBackend.Core.DTOs;

public record MessageDto(
    Guid Id,
    string Content,
    Guid SenderId,
    UserDto Sender,
    Guid CollaborationId,
    bool Read,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateMessageDto(
    string Content,
    Guid CollaborationId
); 