using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;

namespace MovieApp.Features.Reviews;

public static class GetMyReviewEndpoint
{
    public static void MapGetMyReviewEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/reviews/movies/{imdbId}/my-review", [Authorize] async (
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
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.UserId == dbUser.Id && r.ImdbId == imdbId);

            if (review == null)
            {
                return Results.Ok(null);
            }

            return Results.Ok(new ReviewResponse(
                review.Id,
                review.UserId,
                review.User.Email,
                review.ImdbId,
                review.Rating,
                review.ReviewText,
                review.CreatedAt,
                review.UpdatedAt
            ));
        })
        .WithTags("Reviews")
        .RequireAuthorization();
    }
}
