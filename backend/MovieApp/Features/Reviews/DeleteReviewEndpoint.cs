using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Reviews;

public static class DeleteReviewEndpoint
{
    public static void MapDeleteReviewEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/reviews/{imdbId}", [Authorize] async (
            string imdbId,
            ApplicationDbContext dbContext,
            ClaimsPrincipal user) =>
        {
            var userEmail = user.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Results.Unauthorized();
            }

            var dbUser = await dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == userEmail);

            if (dbUser == null)
            {
                return Results.Unauthorized();
            }

            var review = await dbContext.MovieReviews
                .FirstOrDefaultAsync(r => r.UserId == dbUser.Id && r.ImdbId == imdbId);

            if (review == null)
            {
                return Results.NotFound(new { message = "Review not found" });
            }

            dbContext.MovieReviews.Remove(review);
            await dbContext.SaveChangesAsync();

            // Update rating cache
            await UpdateRatingCache(dbContext, imdbId);

            return Results.Ok(new { message = "Review deleted successfully" });
        })
        .WithTags("Reviews")
        .RequireAuthorization();
    }

    private static async Task UpdateRatingCache(ApplicationDbContext dbContext, string imdbId)
    {
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
            // No reviews left, remove cache entry
            var cacheEntry = await dbContext.MovieRatingCaches.FindAsync(imdbId);
            if (cacheEntry != null)
            {
                dbContext.MovieRatingCaches.Remove(cacheEntry);
            }
        }
        else
        {
            var cacheEntry = await dbContext.MovieRatingCaches.FindAsync(imdbId);
            if (cacheEntry == null)
            {
                cacheEntry = new MovieRatingCache
                {
                    ImdbId = imdbId
                };
                dbContext.MovieRatingCaches.Add(cacheEntry);
            }

            cacheEntry.AverageRating = stats.AverageRating;
            cacheEntry.ReviewCount = stats.ReviewCount;
            cacheEntry.LastUpdated = DateTime.UtcNow;
        }

        await dbContext.SaveChangesAsync();
    }
}
