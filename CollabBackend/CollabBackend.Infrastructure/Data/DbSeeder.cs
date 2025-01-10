using CollabBackend.Core.Entities;

namespace CollabBackend.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedData(ApplicationDbContext context)
    {
        if (!context.Users.Any())
        {
            // Create users
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "admin@example.com",
                FirstName = "Admin",
                LastName = "User",
                Role = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!@#"),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var normalUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "normal@example.com",
                FirstName = "Normal",
                LastName = "User",
                Role = "user",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Normal123!@#"),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var user2 = new User
            {
                Id = Guid.NewGuid(),
                Email = "normal2@example.com",
                FirstName = "Normal",
                LastName = "User2",
                Role = "user",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Normal123!@#"),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Users.AddRange(adminUser, normalUser, user2);
            await context.SaveChangesAsync();

            // Create collaborations
            var collaboration1 = new Collaboration
            {
                Id = Guid.NewGuid(),
                Title = "Project Alpha",
                Description = "Our first test project",
                CreatedById = adminUser.Id,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Participants = new List<User> { adminUser, normalUser, user2 }
            };

            var collaboration2 = new Collaboration
            {
                Id = Guid.NewGuid(),
                Title = "Project Beta",
                Description = "Second test project",
                CreatedById = normalUser.Id,
                Status = "completed",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Participants = new List<User> { adminUser, normalUser, user2 }
            };

            var collaboration3 = new Collaboration
            {
                Id = Guid.NewGuid(),
                Title = "Project Gamma",
                Description = "Third test project",
                CreatedById = user2.Id,
                Status = "cancelled",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Participants = new List<User> { adminUser, user2 }
            };

            context.Collaborations.AddRange(collaboration1, collaboration2, collaboration3);
            await context.SaveChangesAsync();

            // Create messages
            var messages = new List<Message>
            {
                // Project Alpha messages
                new Message
                {
                    Id = Guid.NewGuid(),
                    Content = "Welcome to Project Alpha!",
                    SenderId = adminUser.Id,
                    CollaborationId = collaboration1.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Message
                {
                    Id = Guid.NewGuid(),
                    Content = "Thanks for inviting us",
                    SenderId = normalUser.Id,
                    CollaborationId = collaboration1.Id,
                    CreatedAt = DateTime.UtcNow.AddMinutes(5),
                    UpdatedAt = DateTime.UtcNow.AddMinutes(5)
                },
                new Message
                {
                    Id = Guid.NewGuid(),
                    Content = "Hello everyone!",
                    SenderId = user2.Id,
                    CollaborationId = collaboration1.Id,
                    CreatedAt = DateTime.UtcNow.AddMinutes(10),
                    UpdatedAt = DateTime.UtcNow.AddMinutes(10)
                },

                // Project Beta messages
                new Message
                {
                    Id = Guid.NewGuid(),
                    Content = "Project Beta kickoff meeting tomorrow",
                    SenderId = normalUser.Id,
                    CollaborationId = collaboration2.Id,
                    CreatedAt = DateTime.UtcNow.AddHours(1),
                    UpdatedAt = DateTime.UtcNow.AddHours(1)
                },
                new Message
                {
                    Id = Guid.NewGuid(),
                    Content = "I'll prepare the agenda",
                    SenderId = adminUser.Id,
                    CollaborationId = collaboration2.Id,
                    CreatedAt = DateTime.UtcNow.AddHours(1).AddMinutes(15),
                    UpdatedAt = DateTime.UtcNow.AddHours(1).AddMinutes(15)
                },
                new Message
                {
                    Id = Guid.NewGuid(),
                    Content = "Looking forward to it!",
                    SenderId = user2.Id,
                    CollaborationId = collaboration2.Id,
                    CreatedAt = DateTime.UtcNow.AddHours(1).AddMinutes(30),
                    UpdatedAt = DateTime.UtcNow.AddHours(1).AddMinutes(30)
                },

                // Project Gamma messages
                new Message
                {
                    Id = Guid.NewGuid(),
                    Content = "Just us two on this one",
                    SenderId = user2.Id,
                    CollaborationId = collaboration3.Id,
                    CreatedAt = DateTime.UtcNow.AddHours(2),
                    UpdatedAt = DateTime.UtcNow.AddHours(2)
                },
                new Message
                {
                    Id = Guid.NewGuid(),
                    Content = "Let's make it great!",
                    SenderId = adminUser.Id,
                    CollaborationId = collaboration3.Id,
                    CreatedAt = DateTime.UtcNow.AddHours(2).AddMinutes(5),
                    UpdatedAt = DateTime.UtcNow.AddHours(2).AddMinutes(5)
                }
            };

            context.Messages.AddRange(messages);
            await context.SaveChangesAsync();
        }
    }
} 