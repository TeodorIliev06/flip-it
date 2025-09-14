using Microsoft.EntityFrameworkCore;

using FlipIt.Server.Models;

namespace FlipIt.Server.Data;
public class FlipItDbContext : DbContext
{
    public FlipItDbContext(DbContextOptions<FlipItDbContext> options) 
        : base(options)
    {
    }

    public DbSet<Score> Scores { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<PersonalBestScore> PersonalBestScores { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Score>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.PlayerName)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Difficulty)
                .IsRequired()
                .HasMaxLength(20);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Scores)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255);
            entity.HasIndex(e => e.Email)
                .IsUnique();
            entity.Property(e => e.PasswordHash)
                .IsRequired();
        });

        modelBuilder.Entity<PersonalBestScore>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.GameMode)
                .IsRequired()
                .HasMaxLength(50);
                
            entity.Property(e => e.Difficulty)
                .HasMaxLength(20);
                
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // One personal best per user per game mode per difficulty
            entity.HasIndex(e => new { e.UserId, e.GameMode, e.Difficulty })
                .IsUnique();
        });
    }
}
