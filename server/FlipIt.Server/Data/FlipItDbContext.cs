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
        });
    }
}
