using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Library;

public static class RemoveMovieFromCollectionEndpoint
{
    public static void MapRemoveMovieFromCollectionEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/library/collections/{collectionId}/movies/{imdbId}", [Authorize] async (
            int collectionId,
            string imdbId,
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

            // Find and remove the movie
            var movie = await dbContext.CollectionMovies
                .FirstOrDefaultAsync(m => m.CollectionId == collectionId && m.ImdbId == imdbId);

            if (movie == null)
                return Results.NotFound(new { message = "Movie not found in this collection" });

            dbContext.CollectionMovies.Remove(movie);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new { message = "Movie removed from collection" });
        })
        .WithTags("Library")
        .RequireAuthorization();
    }
}
