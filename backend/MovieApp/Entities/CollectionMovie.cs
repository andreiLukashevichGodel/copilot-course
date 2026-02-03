namespace MovieApp.Entities;

public class CollectionMovie
{
    public int Id { get; set; }
    public int CollectionId { get; set; }
    public string ImdbId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string Poster { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Genre { get; set; }
    public DateTime AddedAt { get; set; }
    
    // Navigation property
    public MovieCollection Collection { get; set; } = null!;
}
