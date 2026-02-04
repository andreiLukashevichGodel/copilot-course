using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MovieApp.Tests.Helpers;

namespace MovieApp.Tests.Features.Library;

public class GetCollectionMoviesTests
{
    [Fact]
    public async Task GetCollectionMovies_ReturnsMovies_WhenCollectionExists()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var collectionId = 1;

        // Act
        var movies = await context.CollectionMovies
            .Where(m => m.CollectionId == collectionId)
            .ToListAsync();

        // Assert
        movies.Should().HaveCount(2);
        movies.Should().Contain(m => m.Title == "The Shawshank Redemption");
        movies.Should().Contain(m => m.Title == "The Dark Knight");
    }

    [Fact]
    public async Task GetCollectionMovies_WithGenreFilter_ReturnsFilteredMovies()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var collectionId = 1;
        var filterGenre = "Action";

        // Act
        var movies = await context.CollectionMovies
            .Where(m => m.CollectionId == collectionId && 
                       m.Genre != null && 
                       m.Genre.Contains(filterGenre))
            .ToListAsync();

        // Assert
        movies.Should().HaveCount(1);
        movies[0].Title.Should().Be("The Dark Knight");
        movies[0].Genre.Should().Contain("Action");
    }

    [Fact]
    public async Task GetCollectionMovies_WithYearFilter_ReturnsFilteredMovies()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var collectionId = 1;
        var yearFrom = "2000";

        // Act
        var movies = await context.CollectionMovies
            .Where(m => m.CollectionId == collectionId && 
                       string.Compare(m.Year, yearFrom) >= 0)
            .ToListAsync();

        // Assert
        movies.Should().HaveCount(1);
        movies[0].Title.Should().Be("The Dark Knight");
        movies[0].Year.Should().Be("2008");
    }

    [Fact]
    public async Task GetCollectionMovies_WithRatingFilter_ReturnsFilteredMovies()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var collectionId = 1;
        var minRating = 9.5m;

        // Act
        var movies = await context.CollectionMovies
            .Where(m => m.CollectionId == collectionId)
            .GroupJoin(
                context.MovieRatingCaches,
                movie => movie.ImdbId,
                cache => cache.ImdbId,
                (movie, cache) => new { movie, cache })
            .SelectMany(
                x => x.cache.DefaultIfEmpty(),
                (x, cache) => new { x.movie, cache })
            .Where(x => x.cache != null && x.cache.AverageRating >= minRating)
            .Select(x => x.movie)
            .ToListAsync();

        // Assert
        movies.Should().HaveCount(1);
        movies[0].Title.Should().Be("The Shawshank Redemption");
    }

    [Fact]
    public async Task GetCollectionMovies_SortsByTitle_Ascending()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var collectionId = 1;

        // Act
        var movies = await context.CollectionMovies
            .Where(m => m.CollectionId == collectionId)
            .OrderBy(m => m.Title)
            .ToListAsync();

        // Assert
        movies.Should().HaveCount(2);
        movies[0].Title.Should().Be("The Dark Knight");
        movies[1].Title.Should().Be("The Shawshank Redemption");
    }

    [Fact]
    public async Task GetCollectionGenres_ReturnsUniqueGenres()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var collectionId = 1;

        // Act
        var genreStrings = await context.CollectionMovies
            .Where(m => m.CollectionId == collectionId && !string.IsNullOrEmpty(m.Genre))
            .Select(m => m.Genre)
            .ToListAsync();

        var genres = genreStrings
            .SelectMany(g => g!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .Distinct()
            .OrderBy(g => g)
            .ToList();

        // Assert
        genres.Should().Contain("Action");
        genres.Should().Contain("Crime");
        genres.Should().Contain("Drama");
    }

    [Fact]
    public async Task GetCollectionMovies_Pagination_ReturnsCorrectPage()
    {
        // Arrange
        using var context = TestDbContextFactory.CreateWithTestData();
        var collectionId = 1;
        var page = 1;
        var pageSize = 1;

        // Act
        var query = context.CollectionMovies
            .Where(m => m.CollectionId == collectionId)
            .OrderBy(m => m.Title);

        var totalCount = await query.CountAsync();
        var movies = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Assert
        totalCount.Should().Be(2);
        movies.Should().HaveCount(1);
        movies[0].Title.Should().Be("The Dark Knight"); // First alphabetically
    }
}
