using System;
using System.Collections.Generic;

namespace CollabBackend.Core.Entities;

public class Message
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool Read { get; set; }
    public Guid CollaborationId { get; set; }
    public Collaboration Collaboration { get; set; } = null!;
    public Guid SenderId { get; set; }
    public User Sender { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Mac { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
    
    // New properties for enhanced messaging
    public MessageType MessageType { get; set; } = MessageType.Text;
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public long? FileSize { get; set; }
    public Guid? ReplyToMessageId { get; set; }
    public Message? ReplyToMessage { get; set; }
    public bool IsEdited { get; set; }
    public DateTime? EditedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public MessageDeliveryStatus DeliveryStatus { get; set; } = MessageDeliveryStatus.Sent;
    public virtual ICollection<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
    public virtual ICollection<Message> Replies { get; set; } = new List<Message>();
    
    // For direct messages (when not part of a collaboration)
    public Guid? RecipientId { get; set; }
    public User? Recipient { get; set; }
}

public enum MessageType
{
    Text = 0,
    Image = 1,
    File = 2,
    Audio = 3,
    Video = 4,
    Voice = 5
}

public enum MessageDeliveryStatus
{
    Sent = 0,
    Delivered = 1,
    Read = 2,
    Failed = 3
} 