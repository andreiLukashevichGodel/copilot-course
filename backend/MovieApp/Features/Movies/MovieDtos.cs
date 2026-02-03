namespace MovieApp.Features.Movies;

public record MovieSearchResultDto(
    string Title,
    string Year,
    string ImdbID,
    string Type,
    string Poster
);

public record MovieDetailsDto(
    string Title,
    string Year,
    string Rated,
    string Runtime,
    string Genre,
    string Director,
    string Actors,
    string Plot,
    string Poster,
    string ImdbRating,
    string ImdbID,
    string Type
);

public record SearchMoviesResponse(
    List<MovieSearchResultDto> Movies
);
