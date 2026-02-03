namespace MovieApp.Features.Health;

public static class HealthEndpoint
{
    public static void MapHealthEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/health", () =>
        {
            return Results.Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                service = "MovieApp API"
            });
        })
        .WithName("Health")
        .WithTags("Health");
    }
}
