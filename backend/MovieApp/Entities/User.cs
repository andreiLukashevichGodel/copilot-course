namespace MovieApp.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Navigation property
    public ICollection<MovieCollection> Collections { get; set; } = new List<MovieCollection>();
}
