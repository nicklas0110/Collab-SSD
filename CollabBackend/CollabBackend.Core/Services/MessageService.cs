using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.Services;
using CollabBackend.Core.DTOs;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;
    private readonly CryptoService _cryptoService;
    private readonly IUserRepository _userRepository;

    public MessageService(
        IMessageRepository messageRepository, 
        CryptoService cryptoService,
        IUserRepository userRepository)
    {
        _messageRepository = messageRepository ?? throw new ArgumentNullException(nameof(messageRepository));
        _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
    }

    public string EncryptMessageContent(string content)
    {
        return _cryptoService.EncryptSensitiveData(content);
    }

    public string DecryptMessageContent(string encryptedContent)
    {
        return _cryptoService.DecryptSensitiveData(encryptedContent);
    }

    public async Task<MessageDto> CreateMessageAsync(CreateMessageDto dto, Guid senderId)
    {
        var sanitizedContent = ValidationService.SanitizeInput(dto.Content);
        var encryptedContent = _cryptoService.EncryptSensitiveData(sanitizedContent);

        var message = new Message
        {
            Id = Guid.NewGuid(),
            Content = encryptedContent,
            SenderId = senderId,
            CollaborationId = dto.CollaborationId,
            Read = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdMessage = await _messageRepository.CreateAsync(message);
        var sender = await _userRepository.GetByIdAsync(senderId);

        return new MessageDto(
            createdMessage.Id,
            _cryptoService.DecryptSensitiveData(createdMessage.Content),
            createdMessage.SenderId,
            new UserDto(
                sender!.Id,
                sender.Email,
                sender.FirstName,
                sender.LastName,
                sender.Role,
                sender.CreatedAt,
                sender.UpdatedAt
            ),
            createdMessage.CollaborationId,
            createdMessage.Read,
            createdMessage.CreatedAt,
            createdMessage.UpdatedAt
        );
    }

    public async Task<IEnumerable<MessageDto>> GetMessagesAsync(Guid collaborationId)
    {
        var messages = await _messageRepository.GetByCollaborationIdAsync(collaborationId);
        return messages.Select(m => new MessageDto(
            m.Id,
            _cryptoService.DecryptSensitiveData(m.Content),
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
    }

    public async Task<IEnumerable<MessageDto>> GetAllForUserAsync(Guid userId)
    {
        var messages = await _messageRepository.GetAllForUserAsync(userId);
        return messages.Select(m => new MessageDto(
            m.Id,
            _cryptoService.DecryptSensitiveData(m.Content),
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
    }

    public async Task<IEnumerable<MessageDto>> GetUnreadMessagesAsync(Guid userId)
    {
        var messages = await _messageRepository.GetUnreadByUserIdAsync(userId);
        return messages.Select(m => new MessageDto(
            m.Id,
            _cryptoService.DecryptSensitiveData(m.Content),
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
    }

    public async Task<MessageDto> UpdateMessageAsync(Guid messageId, UpdateMessageDto dto)
    {
        var message = await _messageRepository.GetByIdAsync(messageId);
        if (message == null)
            throw new KeyNotFoundException("Message not found");

        var sanitizedContent = ValidationService.SanitizeInput(dto.Content);
        message.Content = _cryptoService.EncryptSensitiveData(sanitizedContent);
        message.UpdatedAt = DateTime.UtcNow;

        var updatedMessage = await _messageRepository.UpdateAsync(message);
        return new MessageDto(
            updatedMessage.Id,
            _cryptoService.DecryptSensitiveData(updatedMessage.Content),
            updatedMessage.SenderId,
            new UserDto(
                updatedMessage.Sender.Id,
                updatedMessage.Sender.Email,
                updatedMessage.Sender.FirstName,
                updatedMessage.Sender.LastName,
                updatedMessage.Sender.Role,
                updatedMessage.Sender.CreatedAt,
                updatedMessage.Sender.UpdatedAt
            ),
            updatedMessage.CollaborationId,
            updatedMessage.Read,
            updatedMessage.CreatedAt,
            updatedMessage.UpdatedAt
        );
    }
} 