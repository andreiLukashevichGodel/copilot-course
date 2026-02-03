using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq.Dynamic.Core;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Library;

public static class GetCollectionMoviesEndpoint
{
    public static void MapGetCollectionMoviesEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/library/collections/{collectionId}/movies", [Authorize] async (
            int collectionId,
            ApplicationDbContext dbContext,
            ClaimsPrincipal user,
            string? sortBy,
            string? sortOrder,
            string? filterGenres,
            int? filterYearFrom,
            int? filterYearTo,
            decimal? minRating,
            int page = 1,
            int pageSize = 20) =>
        {
            var userEmail = user.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
                return Results.Unauthorized();

            var dbUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (dbUser == null)
                return Results.Unauthorized();

            // Verify collection belongs to user
            var collection = await dbContext.MovieCollections
                .FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == dbUser.Id);

            if (collection == null)
                return Results.NotFound(new { message = "Collection not found" });

            // Build query with left join for ratings
            var query = dbContext.CollectionMovies
                .Where(m => m.CollectionId == collectionId)
                .GroupJoin(
                    dbContext.MovieRatingCaches,
                    movie => movie.ImdbId,
                    cache => cache.ImdbId,
                    (movie, cache) => new { movie, cache })
                .SelectMany(
                    x => x.cache.DefaultIfEmpty(),
                    (x, cache) => new { x.movie, cache });

            // Apply filters
            if (!string.IsNullOrEmpty(filterGenres))
            {
                var genres = filterGenres.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(g => g.Trim())
                    .ToList();
                
                query = query.Where(x => x.movie.Genre != null && 
                    genres.Any(g => x.movie.Genre.Contains(g)));
            }

            if (filterYearFrom.HasValue)
            {
                var yearStr = filterYearFrom.Value.ToString();
                query = query.Where(x => string.Compare(x.movie.Year, yearStr) >= 0);
            }

            if (filterYearTo.HasValue)
            {
                var yearStr = filterYearTo.Value.ToString();
                query = query.Where(x => string.Compare(x.movie.Year, yearStr) <= 0);
            }

            if (minRating.HasValue)
            {
                query = query.Where(x => x.cache != null && x.cache.AverageRating >= minRating.Value);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Apply sorting
            var orderBy = sortBy?.ToLower() switch
            {
                "year" => $"movie.Year {sortOrder?.ToLower() ?? "desc"}",
                "title" => $"movie.Title {sortOrder?.ToLower() ?? "asc"}",
                "rating" => sortOrder?.ToLower() == "asc" 
                    ? "cache.AverageRating asc" 
                    : "cache.AverageRating desc",
                _ => "movie.AddedAt desc" // Default to dateAdded desc
            };

            query = query.OrderBy(orderBy);

            // Apply pagination
            var movies = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new CollectionMovieResponse(
                    x.movie.Id,
                    x.movie.ImdbId,
                    x.movie.Title,
                    x.movie.Year,
                    x.movie.Poster,
                    x.movie.Type,
                    x.movie.Genre,
                    x.cache != null ? x.cache.AverageRating : null,
                    x.movie.AddedAt
                ))
                .ToListAsync();

            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            return Results.Ok(new GetCollectionMoviesResponse(
                Movies: movies,
                TotalCount: totalCount,
                TotalPages: totalPages,
                CurrentPage: page
            ));
        })
        .WithTags("Library")
        .RequireAuthorization();
    }
}
