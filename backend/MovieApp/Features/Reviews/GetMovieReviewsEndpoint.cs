using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;

namespace MovieApp.Features.Reviews;

public static class GetMovieReviewsEndpoint
{
    public static void MapGetMovieReviewsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/reviews/movies/{imdbId}", async (
            string imdbId,
            int skip,
            int take,
            ApplicationDbContext dbContext,
            ClaimsPrincipal? user) =>
        {
            // Default pagination values
            if (take <= 0 || take > 100)
            {
                take = 20;
            }

            if (skip < 0)
            {
                skip = 0;
            }

            // Get current user ID if authenticated
            int? currentUserId = null;
            if (user?.Identity?.IsAuthenticated == true)
            {
                var userEmail = user.FindFirst(ClaimTypes.Email)?.Value;
                if (!string.IsNullOrEmpty(userEmail))
                {
                    var dbUser = await dbContext.Users
                        .FirstOrDefaultAsync(u => u.Email == userEmail);
                    currentUserId = dbUser?.Id;
                }
            }

            // Query reviews, excluding current user's review if authenticated
            var query = dbContext.MovieReviews
                .Include(r => r.User)
                .Where(r => r.ImdbId == imdbId);

            if (currentUserId.HasValue)
            {
                query = query.Where(r => r.UserId != currentUserId.Value);
            }

            // Get reviews with one extra to check if there are more
            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip(skip)
                .Take(take + 1)
                .ToListAsync();

            var hasMore = reviews.Count > take;
            var reviewsToReturn = hasMore ? reviews.Take(take).ToList() : reviews;

            var reviewResponses = reviewsToReturn.Select(r => new ReviewResponse(
                r.Id,
                r.UserId,
                r.User.Email,
                r.ImdbId,
                r.Rating,
                r.ReviewText,
                r.CreatedAt,
                r.UpdatedAt
            )).ToList();

            return Results.Ok(new GetMovieReviewsResponse(
                reviewResponses,
                hasMore
            ));
        })
        .WithTags("Reviews");
    }
}
