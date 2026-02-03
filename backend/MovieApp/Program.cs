using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MovieApp.Database;
using MovieApp.Entities;
using MovieApp.Features.Health;
using MovieApp.Features.Auth;
using MovieApp.Features.Movies;
using MovieApp.Features.Library;
using MovieApp.Features.Reviews;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

builder.Services.AddAuthorization();

// Add application services
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddHttpClient<OmdbApiService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Theme = ScalarTheme.Mars;
        options.DarkMode = true;
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Map feature endpoints
app.MapHealthEndpoint();
app.MapRegisterEndpoint();
app.MapLoginEndpoint();
app.MapSearchMoviesEndpoint();
app.MapGetMovieDetailsEndpoint();
app.MapCreateCollectionEndpoint();
app.MapGetUserCollectionsEndpoint();
app.MapAddMovieToCollectionEndpoint();
app.MapRemoveMovieFromCollectionEndpoint();
app.MapGetCollectionMoviesEndpoint();
app.MapDeleteCollectionEndpoint();
app.MapGetMovieCollectionsEndpoint();
app.MapGetCollectionGenresEndpoint();
app.MapGetDashboardStatsEndpoint();
app.MapCreateOrUpdateReviewEndpoint();
app.MapGetMyReviewEndpoint();
app.MapGetMovieReviewsEndpoint();
app.MapGetMyReviewsEndpoint();
app.MapDeleteReviewEndpoint();
app.MapGetMovieStatsEndpoint();

app.Run();
