using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;
using CollabBackend.Core.Services;
using CollabBackend.Core.DTOs;
using System.Security;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;
    private readonly CryptoService _cryptoService;
    private readonly MacService _macService;
    private readonly DigitalSignatureService _signatureService;
    private readonly IAsymmetricCryptoService _asymmetricService;
    private readonly KeyRotationService _keyRotationService;
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly ICollaborationRepository _collaborationRepository;
    private readonly IUserService _userService;

    public MessageService(
        IMessageRepository messageRepository,
        CryptoService cryptoService,
        MacService macService,
        DigitalSignatureService signatureService,
        IAsymmetricCryptoService asymmetricService,
        KeyRotationService keyRotationService,
        IUserRepository userRepository,
        IConfiguration configuration,
        ICollaborationRepository collaborationRepository,
        IUserService userService)
    {
        _messageRepository = messageRepository;
        _cryptoService = cryptoService;
        _macService = macService;
        _signatureService = signatureService;
        _asymmetricService = asymmetricService;
        _keyRotationService = keyRotationService;
        _userRepository = userRepository;
        _configuration = configuration;
        _collaborationRepository = collaborationRepository;
        _userService = userService;
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
        
        // 1. Get recipient's public key
        var collaboration = await _collaborationRepository.GetByIdAsync(dto.CollaborationId);
        // Get the other participant (not the sender)
        var participants = await _collaborationRepository.GetParticipantsAsync(dto.CollaborationId);
        var recipient = participants.First(p => p.Id != senderId);
        var recipientPublicKey = recipient.PublicKey ?? throw new InvalidOperationException("Recipient public key not found");

        // 2. Encrypt sensitive parts with recipient's public key
        var sensitiveContent = ExtractSensitiveContent(sanitizedContent);
        var encryptedSensitiveContent = _asymmetricService.EncryptWithPublicKey(sensitiveContent, recipientPublicKey);
        
        // 3. Replace sensitive content with encrypted version
        var finalContent = ReplaceSensitiveContent(sanitizedContent, encryptedSensitiveContent);
        
        // 4. Encrypt entire message with symmetric encryption
        var encryptedContent = _cryptoService.EncryptSensitiveData(finalContent);
        
        // 5. Generate MAC for integrity
        var mac = _macService.GenerateMAC(encryptedContent);
        
        // 6. Sign the message
        var senderPrivateKey = _configuration["Crypto:SenderPrivateKey"] 
            ?? throw new InvalidOperationException("Sender private key not configured");
        var signature = _signatureService.SignData(encryptedContent, senderPrivateKey);

        var message = new Message
        {
            Id = Guid.NewGuid(),
            Content = encryptedContent,
            Mac = mac,
            Signature = signature,
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

    private string ExtractSensitiveContent(string content)
    {
        var match = Regex.Match(content, @"\[sensitive\](.*?)\[/sensitive\]");
        return match.Success ? match.Groups[1].Value : string.Empty;
    }

    private string ReplaceSensitiveContent(string originalContent, string encryptedContent)
    {
        return Regex.Replace(
            originalContent, 
            @"\[sensitive\].*?\[/sensitive\]", 
            $"[encrypted]{encryptedContent}[/encrypted]"
        );
    }

    public async Task<IEnumerable<MessageDto>> GetMessagesAsync(Guid collaborationId)
    {
        var messages = await _messageRepository.GetByCollaborationIdAsync(collaborationId);
        var currentUserId = _userService.GetCurrentUserId();
        var currentUser = await _userRepository.GetByIdAsync(currentUserId);
        var userPrivateKey = currentUser!.PrivateKey ?? throw new InvalidOperationException("User private key not found");

        return messages.Select(m => 
        {
            // 1. Verify MAC
            if (!_macService.VerifyMAC(m.Content, m.Mac))
            {
                throw new SecurityException("Message integrity check failed");
            }

            // 2. Verify signature
            var senderPublicKey = _configuration["Crypto:SenderPublicKey"] 
                ?? throw new InvalidOperationException("Sender public key not configured");
            if (!_signatureService.VerifySignature(m.Content, m.Signature, senderPublicKey))
            {
                throw new SecurityException("Message signature verification failed");
            }

            // 3. Decrypt the main content
            var decryptedContent = _cryptoService.DecryptSensitiveData(m.Content);

            // 4. Find and decrypt any encrypted sections
            decryptedContent = DecryptSensitiveParts(decryptedContent, userPrivateKey);

            return new MessageDto(
                m.Id,
                decryptedContent,
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
            );
        });
    }

    private string DecryptSensitiveParts(string content, string privateKey)
    {
        return Regex.Replace(content, @"\[encrypted\](.*?)\[/encrypted\]", match =>
        {
            var encryptedContent = match.Groups[1].Value;
            try
            {
                return _asymmetricService.DecryptWithPrivateKey(encryptedContent, privateKey);
            }
            catch
            {
                return "[Failed to decrypt sensitive content]";
            }
        });
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