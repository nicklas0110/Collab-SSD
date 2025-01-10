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
    public virtual ICollection<Collaboration> Collaborations { get; set; } = new List<Collaboration>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
} 