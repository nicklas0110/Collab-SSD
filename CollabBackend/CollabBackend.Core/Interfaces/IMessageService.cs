using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CollabBackend.Core.DTOs;

namespace CollabBackend.Core.Interfaces;

public interface IMessageService
{
    Task<MessageDto> CreateMessageAsync(CreateMessageDto dto, Guid senderId);
    Task<IEnumerable<MessageDto>> GetMessagesAsync(Guid collaborationId);
    Task<IEnumerable<MessageDto>> GetAllForUserAsync(Guid userId);
    Task<IEnumerable<MessageDto>> GetUnreadMessagesAsync(Guid userId);
    Task<MessageDto> UpdateMessageAsync(Guid messageId, UpdateMessageDto dto);
    string EncryptMessageContent(string content);
    string DecryptMessageContent(string encryptedContent);
} 