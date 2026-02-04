using Microsoft.EntityFrameworkCore;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Tests.Helpers;

public static class TestDbContextFactory
{
    public static ApplicationDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new ApplicationDbContext(options);
        return context;
    }

    public static ApplicationDbContext CreateWithTestData()
    {
        var context = CreateInMemoryContext();
        
        // Add test users
        var user1 = new User
        {
            Id = 1,
            Email = "test@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
            CreatedAt = DateTime.UtcNow
        };
        
        var user2 = new User
        {
            Id = 2,
            Email = "test2@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password456"),
            CreatedAt = DateTime.UtcNow
        };
        
        context.Users.AddRange(user1, user2);
        
        // Add test collections
        var collection1 = new MovieCollection
        {
            Id = 1,
            UserId = 1,
            Name = "Action Movies",
            CreatedAt = DateTime.UtcNow
        };
        
        var collection2 = new MovieCollection
        {
            Id = 2,
            UserId = 1,
            Name = "Drama Movies",
            CreatedAt = DateTime.UtcNow
        };
        
        var collection3 = new MovieCollection
        {
            Id = 3,
            UserId = 2,
            Name = "Comedy Movies",
            CreatedAt = DateTime.UtcNow
        };
        
        context.MovieCollections.AddRange(collection1, collection2, collection3);
        
        // Add test movies
        var movie1 = new CollectionMovie
        {
            Id = 1,
            CollectionId = 1,
            ImdbId = "tt0111161",
            Title = "The Shawshank Redemption",
            Year = "1994",
            Poster = "https://example.com/poster1.jpg",
            Type = "movie",
            Genre = "Drama",
            AddedAt = DateTime.UtcNow.AddDays(-10)
        };
        
        var movie2 = new CollectionMovie
        {
            Id = 2,
            CollectionId = 1,
            ImdbId = "tt0468569",
            Title = "The Dark Knight",
            Year = "2008",
            Poster = "https://example.com/poster2.jpg",
            Type = "movie",
            Genre = "Action, Crime, Drama",
            AddedAt = DateTime.UtcNow.AddDays(-5)
        };
        
        var movie3 = new CollectionMovie
        {
            Id = 3,
            CollectionId = 2,
            ImdbId = "tt0109830",
            Title = "Forrest Gump",
            Year = "1994",
            Poster = "https://example.com/poster3.jpg",
            Type = "movie",
            Genre = "Drama, Romance",
            AddedAt = DateTime.UtcNow.AddDays(-3)
        };
        
        context.CollectionMovies.AddRange(movie1, movie2, movie3);
        
        // Add test reviews
        var review1 = new MovieReview
        {
            Id = 1,
            UserId = 1,
            ImdbId = "tt0111161",
            Rating = 10,
            ReviewText = "Amazing movie! A true masterpiece.",
            CreatedAt = DateTime.UtcNow.AddDays(-3),
            UpdatedAt = DateTime.UtcNow.AddDays(-3)
        };
        
        var review2 = new MovieReview
        {
            Id = 2,
            UserId = 1,
            ImdbId = "tt0468569",
            Rating = 9,
            ReviewText = "Great superhero movie!",
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddDays(-2)
        };
        
        var review3 = new MovieReview
        {
            Id = 3,
            UserId = 2,
            ImdbId = "tt0111161",
            Rating = 9,
            ReviewText = "One of the best films ever made.",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };
        
        context.MovieReviews.AddRange(review1, review2, review3);
        
        // Add rating cache
        var cache1 = new MovieRatingCache
        {
            ImdbId = "tt0111161",
            AverageRating = 9.5m,
            ReviewCount = 2,
            LastUpdated = DateTime.UtcNow
        };
        
        var cache2 = new MovieRatingCache
        {
            ImdbId = "tt0468569",
            AverageRating = 9.0m,
            ReviewCount = 1,
            LastUpdated = DateTime.UtcNow
        };
        
        context.MovieRatingCaches.AddRange(cache1, cache2);
        
        context.SaveChanges();
        return context;
    }
}
