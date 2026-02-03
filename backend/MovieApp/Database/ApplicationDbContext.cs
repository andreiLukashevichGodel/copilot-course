using Microsoft.EntityFrameworkCore;
using MovieApp.Entities;

namespace MovieApp.Database;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<MovieCollection> MovieCollections { get; set; }
    public DbSet<CollectionMovie> CollectionMovies { get; set; }
    public DbSet<MovieReview> MovieReviews { get; set; }
    public DbSet<MovieRatingCache> MovieRatingCaches { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });
        
        modelBuilder.Entity<MovieCollection>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            // Unique constraint: User cannot have duplicate collection names
            entity.HasIndex(e => new { e.UserId, e.Name }).IsUnique();
            
            // Foreign key relationship
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Collections)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<CollectionMovie>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ImdbId).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Year).HasMaxLength(10);
            entity.Property(e => e.Poster).HasMaxLength(1000);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.AddedAt).IsRequired();
            
            // Unique constraint: No duplicate movies in same collection
            entity.HasIndex(e => new { e.CollectionId, e.ImdbId }).IsUnique();
            
            // Foreign key relationship
            entity.HasOne(e => e.Collection)
                  .WithMany(c => c.Movies)
                  .HasForeignKey(e => e.CollectionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<MovieReview>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ImdbId).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Rating).IsRequired();
            entity.Property(e => e.ReviewText).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            // Unique constraint: One review per user per movie
            entity.HasIndex(e => new { e.UserId, e.ImdbId }).IsUnique();
            
            // Index for movie lookups
            entity.HasIndex(e => e.ImdbId);
            
            // Check constraint for rating range
            entity.HasCheckConstraint("CK_MovieReview_Rating", "[Rating] >= 1 AND [Rating] <= 10");
            
            // Foreign key relationship
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<MovieRatingCache>(entity =>
        {
            entity.HasKey(e => e.ImdbId);
            entity.Property(e => e.ImdbId).IsRequired().HasMaxLength(20);
            entity.Property(e => e.AverageRating).IsRequired().HasPrecision(3, 1);
            entity.Property(e => e.ReviewCount).IsRequired();
            entity.Property(e => e.LastUpdated).IsRequired();
        });
    }
}
