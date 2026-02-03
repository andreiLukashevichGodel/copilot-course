using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Library;

public static class CreateCollectionEndpoint
{
    public static void MapCreateCollectionEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/library/collections", [Authorize] async (
            CreateCollectionRequest request,
            ApplicationDbContext dbContext,
            ClaimsPrincipal user) =>
        {
            var userEmail = user.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
                return Results.Unauthorized();

            var dbUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (dbUser == null)
                return Results.Unauthorized();

            // Validate collection name
            if (string.IsNullOrWhiteSpace(request.Name))
                return Results.BadRequest(new { message = "Collection name is required" });

            if (request.Name.Length > 100)
                return Results.BadRequest(new { message = "Collection name must be 100 characters or less" });

            // Check for duplicate collection name
            var existingCollection = await dbContext.MovieCollections
                .FirstOrDefaultAsync(c => c.UserId == dbUser.Id && c.Name.ToLower() == request.Name.ToLower());

            if (existingCollection != null)
                return Results.BadRequest(new { message = "You already have a collection with this name" });

            // Create collection
            var collection = new MovieCollection
            {
                UserId = dbUser.Id,
                Name = request.Name,
                CreatedAt = DateTime.UtcNow
            };

            dbContext.MovieCollections.Add(collection);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new CollectionResponse(
                collection.Id,
                collection.Name,
                0,
                collection.CreatedAt
            ));
        })
        .WithTags("Library")
        .RequireAuthorization();
    }
}
