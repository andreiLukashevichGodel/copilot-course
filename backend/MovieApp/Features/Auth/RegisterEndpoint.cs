using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Auth;

public static class RegisterEndpoint
{
    public static void MapRegisterEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/register", async (
            RegisterRequest request,
            ApplicationDbContext dbContext) =>
        {
            try
            {
                // Validate request
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return Results.BadRequest(new { message = "Email is required" });
                }

                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    return Results.BadRequest(new { message = "Password is required" });
                }

                // Validate email format
                if (!IsValidEmail(request.Email))
                {
                    return Results.BadRequest(new { message = "Invalid email format" });
                }

                // Validate password length
                if (request.Password.Length < 8)
                {
                    return Results.BadRequest(new { message = "Password must be at least 8 characters long" });
                }

                // Check if user already exists
                var existingUser = await dbContext.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (existingUser != null)
                {
                    return Results.BadRequest(new { message = "Email already exists" });
                }

                // Hash password
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Create user
                var user = new User
                {
                    Email = request.Email.ToLower(),
                    PasswordHash = passwordHash,
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.Users.Add(user);
                await dbContext.SaveChangesAsync();

                // Create default "Favorites" collection
                var favoritesCollection = new MovieCollection
                {
                    UserId = user.Id,
                    Name = "Favorites",
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.MovieCollections.Add(favoritesCollection);
                await dbContext.SaveChangesAsync();

                return Results.Ok(new { message = "Registration successful" });
            }
            catch
            {
                return Results.BadRequest(new { message = "Registration failed" });
            }
        })
        .WithName("Register")
        .WithTags("Auth");
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
