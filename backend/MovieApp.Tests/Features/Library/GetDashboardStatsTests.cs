using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MovieApp.Tests.Helpers;

namespace MovieApp.Tests.Features.Library;

public class GetDashboardStatsTests
{
    [Fact]
    public async Task GetDashboardStats_CalculatesTotalCollections_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 1;

        // Act
        var totalCollections = await context.MovieCollections
            .Where(c => c.UserId == userId)
            .CountAsync();

        // Assert
        totalCollections.Should().Be(2);
    }

    [Fact]
    public async Task GetDashboardStats_CalculatesTotalMovies_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 1;

        // Act
        var totalMovies = await context.CollectionMovies
            .Where(cm => cm.Collection.UserId == userId)
            .Select(cm => cm.ImdbId)
            .Distinct()
            .CountAsync();

        // Assert
        totalMovies.Should().Be(3);
    }

    [Fact]
    public async Task GetDashboardStats_CalculatesTotalReviews_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 1;

        // Act
        var totalReviews = await context.MovieReviews
            .Where(r => r.UserId == userId)
            .CountAsync();

        // Assert
        totalReviews.Should().Be(2);
    }

    [Fact]
    public async Task GetDashboardStats_CalculatesAverageRating_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 1;

        // Act
        var averageRating = await context.MovieReviews
            .Where(r => r.UserId == userId)
            .AverageAsync(r => (decimal)r.Rating);

        // Assert
        averageRating.Should().Be(9.5m);
    }

    [Fact]
    public async Task GetDashboardStats_ReturnsRatingDistribution_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 1;

        // Act
        var ratingDistribution = await context.MovieReviews
            .Where(r => r.UserId == userId)
            .GroupBy(r => r.Rating)
            .Select(g => new { Rating = g.Key, Count = g.Count() })
            .OrderBy(r => r.Rating)
            .ToListAsync();

        // Assert
        ratingDistribution.Should().HaveCount(2);
        ratingDistribution.Should().Contain(r => r.Rating == 9 && r.Count == 1);
        ratingDistribution.Should().Contain(r => r.Rating == 10 && r.Count == 1);
    }

    [Fact]
    public async Task GetDashboardStats_ReturnsGenreDistribution_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 1;

        // Act
        var genreDistribution = await context.CollectionMovies
            .Where(cm => cm.Collection.UserId == userId && !string.IsNullOrEmpty(cm.Genre))
            .Select(cm => cm.Genre)
            .ToListAsync();

        var genreCounts = genreDistribution
            .SelectMany(g => g!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .GroupBy(g => g)
            .Select(g => new { Genre = g.Key, Count = g.Count() })
            .OrderByDescending(g => g.Count)
            .ToList();

        // Assert
        genreCounts.Should().Contain(g => g.Genre == "Drama" && g.Count == 3);
        genreCounts.Should().Contain(g => g.Genre == "Action");
    }

    [Fact]
    public async Task GetDashboardStats_ReturnsRecentAdditions_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 1;

        // Act
        var recentAdditions = await context.CollectionMovies
            .Where(cm => cm.Collection.UserId == userId)
            .OrderByDescending(cm => cm.AddedAt)
            .Take(5)
            .Select(cm => new
            {
                cm.ImdbId,
                cm.Title,
                cm.Year,
                cm.AddedAt
            })
            .ToListAsync();

        // Assert
        recentAdditions.Should().HaveCount(3);
        recentAdditions[0].Title.Should().Be("Forrest Gump"); // Most recent
    }

    [Fact]
    public async Task GetDashboardStats_ReturnsTopCollections_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 1;

        // Act
        var topCollections = await context.MovieCollections
            .Where(c => c.UserId == userId)
            .Select(c => new
            {
                c.Id,
                c.Name,
                MovieCount = c.Movies.Count
            })
            .OrderByDescending(c => c.MovieCount)
            .Take(5)
            .ToListAsync();

        // Assert
        topCollections.Should().HaveCount(2);
        topCollections[0].Name.Should().Be("Action Movies");
        topCollections[0].MovieCount.Should().Be(2);
    }

    [Fact]
    public async Task GetDashboardStats_FiltersDataByUser_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var userId = 2;

        // Act
        var totalCollections = await context.MovieCollections
            .Where(c => c.UserId == userId)
            .CountAsync();

        var totalReviews = await context.MovieReviews
            .Where(r => r.UserId == userId)
            .CountAsync();

        // Assert
        totalCollections.Should().Be(1);
        totalReviews.Should().Be(1);
    }
}
