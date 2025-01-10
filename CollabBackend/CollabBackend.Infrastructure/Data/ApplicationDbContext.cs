using CollabBackend.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace CollabBackend.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Collaboration> Collaborations { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasMany(u => u.Collaborations)
            .WithMany(c => c.Participants)
            .UsingEntity(j => j.ToTable("CollaborationParticipants"));

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.Messages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Message>()
            .HasOne(m => m.Collaboration)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.CollaborationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Collaboration>()
            .HasOne(c => c.CreatedBy)
            .WithMany()
            .HasForeignKey(c => c.CreatedById)
            .OnDelete(DeleteBehavior.Cascade);
    }
} 