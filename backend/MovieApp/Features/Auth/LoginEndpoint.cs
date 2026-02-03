using Microsoft.EntityFrameworkCore;
using MovieApp.Database;
using MovieApp.Entities;

namespace MovieApp.Features.Auth;

public static class LoginEndpoint
{
    public static void MapLoginEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/login", async (
            LoginRequest request,
            ApplicationDbContext dbContext,
            JwtTokenService jwtTokenService) =>
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

                // Find user by email
                var user = await dbContext.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

                if (user == null)
                {
                    return Results.BadRequest(new { message = "User not found" });
                }

                // Verify password
                var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

                if (!isValidPassword)
                {
                    return Results.BadRequest(new { message = "Invalid password" });
                }

                // Generate JWT token
                var token = jwtTokenService.GenerateToken(user);
                var expirationMinutes = int.Parse(jwtTokenService.GetType()
                    .GetField("_configuration", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                    ?.GetValue(jwtTokenService) is IConfiguration config 
                        ? config["Jwt:ExpirationInMinutes"] ?? "60" 
                        : "60");

                var response = new AuthResponse
                {
                    Token = token,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
                    Email = user.Email
                };

                return Results.Ok(response);
            }
            catch
            {
                return Results.BadRequest(new { message = "An error occurred during login" });
            }
        })
        .WithName("Login")
        .WithTags("Auth");
    }
}
