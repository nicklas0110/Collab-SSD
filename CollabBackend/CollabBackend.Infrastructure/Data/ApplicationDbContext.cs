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

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // Collaboration configuration
        modelBuilder.Entity<Collaboration>()
            .HasOne(c => c.CreatedBy)
            .WithMany()
            .HasForeignKey(c => c.CreatedById);

        modelBuilder.Entity<Collaboration>()
            .HasMany(c => c.Participants)
            .WithMany()
            .UsingEntity(j => j.ToTable("CollaborationParticipants"));

        // Message configuration
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();
            entity.HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(m => m.Collaboration)
                .WithMany()
                .HasForeignKey(m => m.CollaborationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
} 