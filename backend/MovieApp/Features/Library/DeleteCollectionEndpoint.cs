using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Library;

public static class DeleteCollectionEndpoint
{
    public static void MapDeleteCollectionEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/library/collections/{collectionId}", [Authorize] async (
            int collectionId,
            ApplicationDbContext dbContext,
            ClaimsPrincipal user) =>
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

            // Delete collection (cascade delete will remove all movies)
            dbContext.MovieCollections.Remove(collection);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new { message = "Collection deleted successfully" });
        })
        .WithTags("Library")
        .RequireAuthorization();
    }
}
