using CollabBackend.Core.Entities;
using CollabBackend.Core.Interfaces;

namespace CollabBackend.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedDataAsync(ApplicationDbContext context, IAsymmetricCryptoService asymmetricService)
    {
        if (context.Users.Any()) return;

        // Generate key pairs for users
        var adminKeyPair = asymmetricService.GenerateKeyPair();
        var user1KeyPair = asymmetricService.GenerateKeyPair();
        var user2KeyPair = asymmetricService.GenerateKeyPair();

        // Create users with key pairs
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!@#"),
            FirstName = "Admin",
            LastName = "User",
            Role = "admin",
            PublicKey = adminKeyPair.PublicKey,
            PrivateKey = adminKeyPair.PrivateKey,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var user1 = new User
        {
            Id = Guid.NewGuid(),
            Email = "john@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Normal123!@#"),
            FirstName = "John",
            LastName = "Doe",
            Role = "user",
            PublicKey = user1KeyPair.PublicKey,
            PrivateKey = user1KeyPair.PrivateKey,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var user2 = new User
        {
            Id = Guid.NewGuid(),
            Email = "jane@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Normal123!@#"),
            FirstName = "Jane",
            LastName = "Smith",
            Role = "user",
            PublicKey = user2KeyPair.PublicKey,
            PrivateKey = user2KeyPair.PrivateKey,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(adminUser, user1, user2);
        await context.SaveChangesAsync();

        // Create collaborations
        var collaboration1 = new Collaboration
        {
            Id = Guid.NewGuid(),
            Title = "Project Alpha",
            Description = "First test project",
            CreatedById = adminUser.Id,
            Status = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Participants = new List<User> { adminUser, user1, user2 }
        };

        var collaboration2 = new Collaboration
        {
            Id = Guid.NewGuid(),
            Title = "Project Beta",
            Description = "Second test project",
            CreatedById = user1.Id,
            Status = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Participants = new List<User> { adminUser,user1, user2 }
        };

        var collaboration3 = new Collaboration
        {
            Id = Guid.NewGuid(),
            Title = "Project Gamma",
            Description = "Third test project",
            CreatedById = user2.Id,
            Status = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Participants = new List<User> { adminUser, user2 }
        };

        context.Collaborations.AddRange(collaboration1, collaboration2, collaboration3);
        await context.SaveChangesAsync();

        // Create messages with encryption and signatures
        var messages = new[]
        {
            CreateMessage("Hej 1", adminUser, collaboration1),
            CreateMessage("Hej 2", user1, collaboration1),
            CreateMessage("Hej 3", user2, collaboration1),
            CreateMessage("Hej 4", user1, collaboration2),
            CreateMessage("Hej 5", user2, collaboration2),
            CreateMessage("Hej 6", user2, collaboration3),
            CreateMessage("Hej 7", adminUser, collaboration3)
        };

        context.Messages.AddRange(messages);
        await context.SaveChangesAsync();
    }

    private static Message CreateMessage(string content, User sender, Collaboration collab)
    {
        // Note: In a real application, you would encrypt and sign the message here
        return new Message
        {
            Id = Guid.NewGuid(),
            Content = content,  // In production, this would be encrypted
            SenderId = sender.Id,
            CollaborationId = collab.Id,
            Mac = "dummy-mac",  // In production, this would be a real MAC
            Signature = "dummy-signature",  // In production, this would be a real signature
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Read = false
        };
    }
} 