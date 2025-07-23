using System;
using System.Collections.Generic;
using CollabBackend.Core.Entities;

namespace CollabBackend.Core.DTOs;

public record CreateMessageDto(
    string Content,
    Guid? CollaborationId = null,
    Guid? RecipientId = null,
    MessageType MessageType = MessageType.Text,
    string? FileUrl = null,
    string? FileName = null,
    long? FileSize = null,
    Guid? ReplyToMessageId = null
);

public record MessageDto(
    Guid Id,
    string Content,
    Guid SenderId,
    UserDto Sender,
    Guid? CollaborationId,
    Guid? RecipientId,
    bool Read,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    MessageType MessageType = MessageType.Text,
    string? FileUrl = null,
    string? FileName = null,
    long? FileSize = null,
    Guid? ReplyToMessageId = null,
    MessageDto? ReplyToMessage = null,
    bool IsEdited = false,
    DateTime? EditedAt = null,
    bool IsDeleted = false,
    MessageDeliveryStatus DeliveryStatus = MessageDeliveryStatus.Sent,
    ICollection<MessageReactionDto>? Reactions = null
);

public record MessageReactionDto(
    Guid Id,
    Guid MessageId,
    Guid UserId,
    UserDto User,
    string Emoji,
    DateTime CreatedAt
);

public record UpdateMessageDto(
    string Content
);

public record EditMessageDto(
    string Content
);

public record MessageReactionCreateDto(
    string Emoji
);