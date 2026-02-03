using Microsoft.EntityFrameworkCore;
using MovieApp.Database;
using System.Security.Claims;

namespace MovieApp.Features.Library;

public static class GetDashboardStatsEndpoint
{
    public static void MapGetDashboardStatsEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/library/dashboard/stats", async (
            ApplicationDbContext db,
            ClaimsPrincipal user) =>
        {
            var userEmail = user.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(userEmail))
            {
                return Results.Unauthorized();
            }

            var dbUser = await db.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
            if (dbUser == null)
            {
                return Results.Unauthorized();
            }

            // Get total collections count
            var totalCollections = await db.MovieCollections
                .Where(c => c.UserId == dbUser.Id)
                .CountAsync();

            // Get total movies count across all collections
            var totalMovies = await db.CollectionMovies
                .Where(cm => cm.Collection.UserId == dbUser.Id)
                .Select(cm => cm.ImdbId)
                .Distinct()
                .CountAsync();

            // Get total reviews count
            var totalReviews = await db.MovieReviews
                .Where(r => r.UserId == dbUser.Id)
                .CountAsync();

            // Get average rating
            var averageRating = await db.MovieReviews
                .Where(r => r.UserId == dbUser.Id)
                .AverageAsync(r => (decimal?)r.Rating) ?? 0;

            // Get rating distribution (1-10)
            var ratingDistributionRaw = await db.MovieReviews
                .Where(r => r.UserId == dbUser.Id)
                .GroupBy(r => r.Rating)
                .Select(g => new
                {
                    Rating = g.Key,
                    Count = g.Count()
                })
                .OrderBy(r => r.Rating)
                .ToListAsync();

            var ratingDistribution = ratingDistributionRaw
                .Select(x => new RatingDistributionItem(x.Rating, x.Count))
                .ToList();


            // Ensure all ratings 1-10 are represented
            var allRatings = Enumerable.Range(1, 10)
                .Select(rating => new RatingDistributionItem(
                    rating,
                    ratingDistribution.FirstOrDefault(r => r.Rating == rating)?.Count ?? 0
                ))
                .ToList();

            // Get genre distribution (top 10)
            var genreDistribution = await db.CollectionMovies
                .Where(cm => cm.Collection.UserId == dbUser.Id && !string.IsNullOrEmpty(cm.Genre))
                .Select(cm => cm.Genre)
                .ToListAsync();

            var genreCounts = genreDistribution
                .SelectMany(g => g!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                .GroupBy(g => g)
                .Select(g => new GenreDistributionItem(g.Key, g.Count()))
                .OrderByDescending(g => g.Count)
                .Take(10)
                .ToList();

            // Get recent additions (last 5)
            var recentAdditions = await db.CollectionMovies
                .Where(cm => cm.Collection.UserId == dbUser.Id)
                .OrderByDescending(cm => cm.AddedAt)
                .Take(5)
                .Select(cm => new RecentAdditionItem(
                    cm.ImdbId,
                    cm.Title,
                    cm.Year,
                    cm.AddedAt
                ))
                .ToListAsync();

            // Get top collections (by movie count)
            var topCollectionsRaw = await db.MovieCollections
                .Where(c => c.UserId == dbUser.Id)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    MovieCount = c.Movies.Count()
                })
                .OrderByDescending(x => x.MovieCount)
                .Take(5)
                .ToListAsync();

            var topCollections = topCollectionsRaw
                .Select(x => new TopCollectionItem(x.Id, x.Name, x.MovieCount))
                .ToList();

            var response = new DashboardStatsResponse(
                totalCollections,
                totalMovies,
                totalReviews,
                Math.Round(averageRating, 1),
                allRatings,
                genreCounts,
                recentAdditions,
                topCollections
            );

            return Results.Ok(response);
        })
        .RequireAuthorization();
    }
}
