using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using MovieApp.Database;
using MovieApp.Entities;
using MovieApp.Features.Movies;

namespace MovieApp.Features.Library;

public static class AddMovieToCollectionEndpoint
{
    public static void MapAddMovieToCollectionEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/library/collections/{collectionId}/movies", [Authorize] async (
            int collectionId,
            AddMovieToCollectionRequest request,
            ApplicationDbContext dbContext,
            OmdbApiService omdbService,
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

            // Check if movie already exists in this collection
            var existingMovie = await dbContext.CollectionMovies
                .FirstOrDefaultAsync(m => m.CollectionId == collectionId && m.ImdbId == request.ImdbId);

            if (existingMovie != null)
                return Results.BadRequest(new { message = $"This movie is already in your {collection.Name} collection" });

            // Fetch genre from OMDB
            string? genre = null;
            try
            {
                var movieDetails = await omdbService.GetMovieDetailsAsync(request.ImdbId);
                genre = movieDetails?.Genre;
            }
            catch
            {
                // Continue without genre if fetch fails
            }

            // Add movie to collection
            var collectionMovie = new CollectionMovie
            {
                CollectionId = collectionId,
                ImdbId = request.ImdbId,
                Title = request.Title,
                Year = request.Year,
                Poster = request.Poster,
                Type = request.Type,
                Genre = genre,
                AddedAt = DateTime.UtcNow
            };

            dbContext.CollectionMovies.Add(collectionMovie);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new CollectionMovieResponse(
                collectionMovie.Id,
                collectionMovie.ImdbId,
                collectionMovie.Title,
                collectionMovie.Year,
                collectionMovie.Poster,
                collectionMovie.Type,
                collectionMovie.Genre,
                null, // AverageRating will be null for newly added movies
                collectionMovie.AddedAt
            ));
        })
        .WithTags("Library")
        .RequireAuthorization();
    }
}
