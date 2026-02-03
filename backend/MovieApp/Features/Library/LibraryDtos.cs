namespace MovieApp.Features.Library;

// Request DTOs
public record CreateCollectionRequest(string Name);

public record AddMovieToCollectionRequest(
    string ImdbId,
    string Title,
    string Year,
    string Poster,
    string Type
);

// Response DTOs
public record CollectionResponse(
    int Id,
    string Name,
    int MovieCount,
    DateTime CreatedAt
);

public record CollectionMovieResponse(
    int Id,
    string ImdbId,
    string Title,
    string Year,
    string Poster,
    string Type,
    string? Genre,
    decimal? AverageRating,
    DateTime AddedAt
);

public record GetCollectionsResponse(List<CollectionResponse> Collections);

public record GetCollectionMoviesResponse(
    List<CollectionMovieResponse> Movies,
    int TotalCount,
    int TotalPages,
    int CurrentPage
);

public record MovieCollectionNameResponse(int Id, string Name);

public record GetMovieCollectionsResponse(List<MovieCollectionNameResponse> Collections);

// Dashboard DTOs
public record RatingDistributionItem(int Rating, int Count);

public record GenreDistributionItem(string Genre, int Count);

public record RecentAdditionItem(string ImdbId, string Title, string Year, DateTime AddedAt);

public record TopCollectionItem(int Id, string Name, int MovieCount);

public record DashboardStatsResponse(
    int TotalCollections,
    int TotalMovies,
    int TotalReviews,
    decimal AverageRating,
    List<RatingDistributionItem> RatingDistribution,
    List<GenreDistributionItem> GenreDistribution,
    List<RecentAdditionItem> RecentAdditions,
    List<TopCollectionItem> TopCollections
);
