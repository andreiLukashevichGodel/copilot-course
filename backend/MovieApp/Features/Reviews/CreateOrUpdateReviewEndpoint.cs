using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Reviews;

public static class CreateOrUpdateReviewEndpoint
{
    public static void MapCreateOrUpdateReviewEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/reviews", [Authorize] async (
            CreateReviewRequest request,
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

            // Validate rating
            if (request.Rating < 1 || request.Rating > 10)
            {
                return Results.BadRequest(new { message = "Rating must be between 1 and 10" });
            }

            // Validate review text if provided
            if (!string.IsNullOrWhiteSpace(request.ReviewText) && request.ReviewText.Length < 10)
            {
                return Results.BadRequest(new { message = "Review text must be at least 10 characters" });
            }

            if (!string.IsNullOrWhiteSpace(request.ReviewText) && request.ReviewText.Length > 2000)
            {
                return Results.BadRequest(new { message = "Review text cannot exceed 2000 characters" });
            }

            // Check if review already exists
            var existingReview = await dbContext.MovieReviews
                .FirstOrDefaultAsync(r => r.UserId == dbUser.Id && r.ImdbId == request.ImdbId);

            if (existingReview != null)
            {
                // Update existing review
                existingReview.Rating = request.Rating;
                existingReview.ReviewText = string.IsNullOrWhiteSpace(request.ReviewText) ? null : request.ReviewText;
                existingReview.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Create new review
                var review = new MovieReview
                {
                    UserId = dbUser.Id,
                    ImdbId = request.ImdbId,
                    Rating = request.Rating,
                    ReviewText = string.IsNullOrWhiteSpace(request.ReviewText) ? null : request.ReviewText,
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.MovieReviews.Add(review);
            }

            await dbContext.SaveChangesAsync();

            // Update rating cache
            await UpdateRatingCache(dbContext, request.ImdbId);

            // Fetch the updated/created review
            var savedReview = await dbContext.MovieReviews
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.UserId == dbUser.Id && r.ImdbId == request.ImdbId);

            return Results.Ok(new ReviewResponse(
                savedReview!.Id,
                savedReview.UserId,
                savedReview.User.Email,
                savedReview.ImdbId,
                savedReview.Rating,
                savedReview.ReviewText,
                savedReview.CreatedAt,
                savedReview.UpdatedAt
            ));
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
