using System.Text.Json;

namespace MovieApp.Features.Movies;

public class OmdbApiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    public OmdbApiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["ExternalApis:OmdbApiKey"] 
            ?? throw new InvalidOperationException("OMDB API key not configured");
        _baseUrl = configuration["ExternalApis:OmdbBaseUrl"] 
            ?? throw new InvalidOperationException("OMDB base URL not configured");
    }

    public async Task<OmdbSearchResponse?> SearchMoviesAsync(string query)
    {
        try
        {
            var url = $"{_baseUrl}/?apikey={_apiKey}&s={Uri.EscapeDataString(query)}";
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<OmdbSearchResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch
        {
            return null;
        }
    }

    public async Task<OmdbMovieDetails?> GetMovieDetailsAsync(string imdbId)
    {
        try
        {
            var url = $"{_baseUrl}/?apikey={_apiKey}&i={Uri.EscapeDataString(imdbId)}";
            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<OmdbMovieDetails>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch
        {
            return null;
        }
    }
}

public record OmdbSearchResponse(
    List<OmdbSearchResult>? Search,
    string? Response,
    string? Error
);

public record OmdbSearchResult(
    string Title,
    string Year,
    string ImdbID,
    string Type,
    string Poster
);

public record OmdbMovieDetails(
    string Title,
    string Year,
    string Rated,
    string Released,
    string Runtime,
    string Genre,
    string Director,
    string Writer,
    string Actors,
    string Plot,
    string Language,
    string Country,
    string Awards,
    string Poster,
    string Metascore,
    string ImdbRating,
    string ImdbVotes,
    string ImdbID,
    string Type,
    string Response
);
