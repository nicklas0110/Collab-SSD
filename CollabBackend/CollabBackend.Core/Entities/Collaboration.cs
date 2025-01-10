using System;
using System.Collections.Generic;

namespace CollabBackend.Core.Entities;

public class Collaboration
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public List<User> Participants { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}