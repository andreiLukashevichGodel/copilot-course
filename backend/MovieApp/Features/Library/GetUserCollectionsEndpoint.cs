using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Library;

public static class GetUserCollectionsEndpoint
{
    public static void MapGetUserCollectionsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/library/collections", [Authorize] async (
            ApplicationDbContext dbContext,
            ClaimsPrincipal user) =>
        {
            var userEmail = user.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
                return Results.Unauthorized();

            var dbUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (dbUser == null)
                return Results.Unauthorized();

            var collections = await dbContext.MovieCollections
                .Where(c => c.UserId == dbUser.Id)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CollectionResponse(
                    c.Id,
                    c.Name,
                    c.Movies.Count,
                    c.CreatedAt
                ))
                .ToListAsync();

            return Results.Ok(new GetCollectionsResponse(collections));
        })
        .WithTags("Library")
        .RequireAuthorization();
    }
}
