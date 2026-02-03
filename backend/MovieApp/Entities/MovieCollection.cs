namespace MovieApp.Entities;

public class MovieCollection
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<CollectionMovie> Movies { get; set; } = new List<CollectionMovie>();
}
