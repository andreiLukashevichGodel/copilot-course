namespace MovieApp.Features.Reviews;

// Request DTOs
public record CreateReviewRequest(
    string ImdbId,
    int Rating,
    string? ReviewText
);

// Response DTOs
public record ReviewResponse(
    int Id,
    int UserId,
    string UserEmail,
    string ImdbId,
    int Rating,
    string? ReviewText,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record MovieStatsResponse(
    decimal AverageRating,
    int ReviewCount
);

public record GetMovieReviewsResponse(
    List<ReviewResponse> Reviews,
    bool HasMore
);

public record GetMyReviewsResponse(
    List<ReviewResponse> Reviews
);
