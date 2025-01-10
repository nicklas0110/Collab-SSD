using System;
using System.Collections.Generic;

namespace CollabBackend.Core.Entities;

public class Collaboration
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public virtual ICollection<User> Participants { get; set; } = new List<User>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}