namespace MovieApp.Entities;

public class MovieReview
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string ImdbId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? ReviewText { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation property
    public User User { get; set; } = null!;
}
