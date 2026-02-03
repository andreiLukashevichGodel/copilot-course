using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;

namespace MovieApp.Features.Library;

public static class GetCollectionGenresEndpoint
{
    public static void MapGetCollectionGenresEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/library/collections/{collectionId}/genres", [Authorize] async (
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

            // Get all unique genres from the collection
            var genres = await dbContext.CollectionMovies
                .Where(m => m.CollectionId == collectionId && m.Genre != null && m.Genre != "")
                .Select(m => m.Genre!)
                .Distinct()
                .ToListAsync();

            // Split comma-separated genres and get unique values
            var allGenres = genres
                .SelectMany(g => g.Split(',', StringSplitOptions.RemoveEmptyEntries))
                .Select(g => g.Trim())
                .Distinct()
                .OrderBy(g => g)
                .ToList();

            return Results.Ok(new GetCollectionGenresResponse(allGenres));
        })
        .WithTags("Library")
        .RequireAuthorization();
    }
}

public record GetCollectionGenresResponse(List<string> Genres);
