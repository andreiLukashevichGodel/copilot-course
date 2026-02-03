using Microsoft.EntityFrameworkCore;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Reviews;

public static class GetMovieStatsEndpoint
{
    public static void MapGetMovieStatsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/reviews/movies/{imdbId}/stats", async (
            string imdbId,
            ApplicationDbContext dbContext) =>
        {
            // Try to get from cache first
            var cached = await dbContext.MovieRatingCaches.FindAsync(imdbId);

            if (cached != null)
            {
                return Results.Ok(new MovieStatsResponse(
                    cached.AverageRating,
                    cached.ReviewCount
                ));
            }

            // No cache found, compute stats
            var stats = await dbContext.MovieReviews
                .Where(r => r.ImdbId == imdbId)
                .GroupBy(r => r.ImdbId)
                .Select(g => new
                {
                    AverageRating = g.Average(r => (decimal)r.Rating),
                    ReviewCount = g.Count()
                })
                .FirstOrDefaultAsync();

            if (stats == null)
            {
                // No reviews yet
                return Results.Ok(new MovieStatsResponse(0, 0));
            }

            // Cache the stats
            var cacheEntry = new MovieRatingCache
            {
                ImdbId = imdbId,
                AverageRating = stats.AverageRating,
                ReviewCount = stats.ReviewCount,
                LastUpdated = DateTime.UtcNow
            };

            dbContext.MovieRatingCaches.Add(cacheEntry);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new MovieStatsResponse(
                stats.AverageRating,
                stats.ReviewCount
            ));
        })
        .WithTags("Reviews");
    }
}
