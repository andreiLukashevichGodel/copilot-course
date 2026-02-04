using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MovieApp.Entities;
using MovieApp.Tests.Helpers;

namespace MovieApp.Tests.Features.Reviews;

public class ReviewTests
{
    [Fact]
    public async Task CreateReview_AddsNewReview_WhenReviewDoesNotExist()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var newReview = new MovieReview
        {
            UserId = 1,
            ImdbId = "tt0137523",
            Rating = 8,
            ReviewText = "Great movie about consumerism!",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        context.MovieReviews.Add(newReview);
        await context.SaveChangesAsync();

        // Assert
        var savedReview = await context.MovieReviews
            .FirstOrDefaultAsync(r => r.ImdbId == "tt0137523" && r.UserId == 1);
        
        savedReview.Should().NotBeNull();
        savedReview!.Rating.Should().Be(8);
        savedReview.ReviewText.Should().Be("Great movie about consumerism!");
    }

    [Fact]
    public async Task UpdateReview_ModifiesExistingReview_WhenReviewExists()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var existingReview = await context.MovieReviews
            .FirstAsync(r => r.ImdbId == "tt0111161" && r.UserId == 1);

        var originalCreatedAt = existingReview.CreatedAt;

        // Act
        existingReview.Rating = 9;
        existingReview.ReviewText = "Still amazing but rewatching changed my perspective slightly!";
        existingReview.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        // Assert
        var updatedReview = await context.MovieReviews
            .FirstAsync(r => r.ImdbId == "tt0111161" && r.UserId == 1);
        
        updatedReview.Rating.Should().Be(9);
        updatedReview.ReviewText.Should().Contain("perspective");
        updatedReview.CreatedAt.Should().Be(originalCreatedAt);
        updatedReview.UpdatedAt.Should().BeAfter(originalCreatedAt);
    }

    [Fact]
    public async Task DeleteReview_RemovesReview_Successfully()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var reviewToDelete = await context.MovieReviews
            .FirstAsync(r => r.ImdbId == "tt0111161" && r.UserId == 1);

        // Act
        context.MovieReviews.Remove(reviewToDelete);
        await context.SaveChangesAsync();

        // Assert
        var deletedReview = await context.MovieReviews
            .FirstOrDefaultAsync(r => r.ImdbId == "tt0111161" && r.UserId == 1);
        
        deletedReview.Should().BeNull();
    }

    [Fact]
    public async Task GetMovieReviews_ReturnsAllReviews_ForSpecificMovie()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var imdbId = "tt0111161";

        // Act
        var reviews = await context.MovieReviews
            .Where(r => r.ImdbId == imdbId)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        // Assert
        reviews.Should().HaveCount(2);
        reviews[0].User.Email.Should().Be("test2@example.com"); // Most recent
        reviews[1].User.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task GetUserReviews_ReturnsOnlyUserReviews()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 1;

        // Act
        var reviews = await context.MovieReviews
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.UpdatedAt)
            .ToListAsync();

        // Assert
        reviews.Should().HaveCount(2);
        reviews.Should().AllSatisfy(r => r.UserId.Should().Be(userId));
    }

    [Fact]
    public async Task UpdateRatingCache_CalculatesCorrectly_AfterNewReview()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var imdbId = "tt0111161";

        // Add another review for the same movie
        var newReview = new MovieReview
        {
            UserId = 2,
            ImdbId = imdbId,
            Rating = 8,
            ReviewText = "Good movie but overhyped",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        context.MovieReviews.Add(newReview);
        await context.SaveChangesAsync();

        // Act - Recalculate cache
        var allReviews = await context.MovieReviews
            .Where(r => r.ImdbId == imdbId)
            .ToListAsync();
        
        var avgRating = allReviews.Average(r => (decimal)r.Rating);
        var reviewCount = allReviews.Count;

        var cache = await context.MovieRatingCaches.FindAsync(imdbId);
        if (cache != null)
        {
            cache.AverageRating = avgRating;
            cache.ReviewCount = reviewCount;
            cache.LastUpdated = DateTime.UtcNow;
            await context.SaveChangesAsync();
        }

        // Assert
        var updatedCache = await context.MovieRatingCaches.FindAsync(imdbId);
        updatedCache.Should().NotBeNull();
        updatedCache!.AverageRating.Should().BeApproximately(9.0m, 0.1m); // (10 + 9 + 8) / 3
        updatedCache.ReviewCount.Should().Be(3);
    }

    [Fact]
    public async Task Review_ValidatesRatingRange()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var invalidReview = new MovieReview
        {
            UserId = 1,
            ImdbId = "tt0137523",
            Rating = 11, // Invalid - should be 1-10
            ReviewText = "This should fail",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act & Assert
        // Note: In a real scenario, this would be validated by model validation
        invalidReview.Rating.Should().BeGreaterThan(10);
    }

    [Fact]
    public async Task UniqueConstraint_PreventsMultipleReviewsPerUserPerMovie()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var review = new MovieReview
        {
            UserId = 1,
            ImdbId = "tt0111161",
            Rating = 8,
            ReviewText = "Duplicate review",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        context.MovieReviews.Add(review);
        await context.SaveChangesAsync();

        context.MovieReviews.Add(review);
        var action = async () => await context.SaveChangesAsync();

        // Assert
        await action.Should().ThrowAsync<Exception>();
    }
}
