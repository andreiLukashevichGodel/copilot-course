namespace MovieApp.Features.Movies;

public static class GetMovieDetailsEndpoint
{
    public static void MapGetMovieDetailsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/movies/{imdbId}", async (
            string imdbId,
            OmdbApiService omdbService) =>
        {
            if (string.IsNullOrWhiteSpace(imdbId))
            {
                return Results.BadRequest(new { message = "Movie ID is required" });
            }

            var result = await omdbService.GetMovieDetailsAsync(imdbId);

            if (result == null || result.Response == "False")
            {
                return Results.NotFound(new { message = "Movie not found" });
            }

            var movieDetails = new MovieDetailsDto(
                result.Title,
                result.Year,
                result.Rated,
                result.Runtime,
                result.Genre,
                result.Director,
                result.Actors,
                result.Plot,
                result.Poster,
                result.ImdbRating,
                result.ImdbID,
                result.Type
            );

            return Results.Ok(movieDetails);
        })
        .WithName("GetMovieDetails")
        .WithTags("Movies");
    }
}
