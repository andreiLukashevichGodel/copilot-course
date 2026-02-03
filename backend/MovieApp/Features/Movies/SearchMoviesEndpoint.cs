namespace MovieApp.Features.Movies;

public static class SearchMoviesEndpoint
{
    public static void MapSearchMoviesEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/movies/search", async (
            string? query,
            OmdbApiService omdbService) =>
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Results.BadRequest(new { message = "Search query is required" });
            }

            var result = await omdbService.SearchMoviesAsync(query);

            if (result == null || result.Response == "False" || result.Search == null)
            {
                return Results.Ok(new SearchMoviesResponse(new List<MovieSearchResultDto>()));
            }

            var movies = result.Search.Select(m => new MovieSearchResultDto(
                m.Title,
                m.Year,
                m.ImdbID,
                m.Type,
                m.Poster
            )).ToList();

            return Results.Ok(new SearchMoviesResponse(movies));
        })
        .WithName("SearchMovies")
        .WithTags("Movies");
    }
}
