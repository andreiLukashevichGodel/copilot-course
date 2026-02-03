namespace MovieApp.Entities;

public class MovieRatingCache
{
    public string ImdbId { get; set; } = string.Empty;
    public decimal AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public DateTime LastUpdated { get; set; }
}
