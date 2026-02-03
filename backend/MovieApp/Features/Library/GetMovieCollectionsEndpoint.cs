using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Library;

public static class GetMovieCollectionsEndpoint
{
    public static void MapGetMovieCollectionsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/library/movies/{imdbId}/collections", [Authorize] async (
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

            // Get all collections that contain this movie for the current user
            var collections = await dbContext.MovieCollections
                .Where(c => c.UserId == dbUser.Id && c.Movies.Any(m => m.ImdbId == imdbId))
                .OrderBy(c => c.Name)
                .Select(c => new MovieCollectionNameResponse(c.Id, c.Name))
                .ToListAsync();

            return Results.Ok(new GetMovieCollectionsResponse(collections));
        })
        .WithTags("Library")
        .RequireAuthorization();
    }
}
