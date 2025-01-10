using System;

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
} 