using System.ComponentModel.DataAnnotations;

namespace CollabBackend.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? PublicKey { get; set; }
    public string? PrivateKey { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // New properties for enhanced user features
    public bool IsOnline { get; set; }
    public DateTime? LastSeen { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? Status { get; set; } // Custom status message
    public bool IsTyping { get; set; }
    public Guid? TypingInCollaborationId { get; set; }
    
    public virtual ICollection<Collaboration> Collaborations { get; set; } = new List<Collaboration>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    public virtual ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
    public virtual ICollection<MessageReaction> MessageReactions { get; set; } = new List<MessageReaction>();
} 