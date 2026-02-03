using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;

namespace MovieApp.Features.Reviews;

public static class GetMyReviewsEndpoint
{
    public static void MapGetMyReviewsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/reviews/my-reviews", [Authorize] async (
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

            var reviews = await dbContext.MovieReviews
                .Include(r => r.User)
                .Where(r => r.UserId == dbUser.Id)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var reviewResponses = reviews.Select(r => new ReviewResponse(
                r.Id,
                r.UserId,
                r.User.Email,
                r.ImdbId,
                r.Rating,
                r.ReviewText,
                r.CreatedAt,
                r.UpdatedAt
            )).ToList();

            return Results.Ok(new GetMyReviewsResponse(reviewResponses));
        })
        .WithTags("Reviews")
        .RequireAuthorization();
    }
}
