# MovieApp

A comprehensive movie collection management application that allows users to search for movies, organize them into collections, write reviews, and track statistics.

## Tech Stack

### Backend
- **Framework**: ASP.NET Core 10.0 with Minimal API
- **Architecture**: Vertical Slice pattern
- **Database**: SQL Server (Local)
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **External API**: OMDB API for movie data
- **API Design**: RESTful endpoints organized in Features folder

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.5.14
- **Routing**: React Router DOM
- **Styling**: TailwindCSS
- **State Management**: React Context API (AuthContext)
- **Port**: 5173

### External Services
- **Movie Data**: OMDB API (https://www.omdbapi.com/)

## Features

### Authentication & User Management
- ✅ User registration with email validation
- ✅ JWT-based authentication
- ✅ Secure password hashing
- ✅ Protected routes and API endpoints

### Movie Search & Discovery
- ✅ Real-time movie search using OMDB API
- ✅ Movie details with poster, plot, ratings, cast, and director
- ✅ Community ratings and reviews display

### Collection Management
- ✅ Create and manage multiple movie collections
- ✅ Add/remove movies from collections
- ✅ Advanced filtering by genre, year, rating, and date added
- ✅ Sorting options (title, year, date added, rating)
- ✅ Pagination (20 items per page)
- ✅ URL-based filter persistence
- ✅ Genre auto-population from OMDB
- ✅ Backfill utility for existing movies

### Review System
- ✅ Write and edit personal movie reviews
- ✅ Rate movies on a 1-10 scale
- ✅ View all user reviews with timestamps
- ✅ Edit and delete own reviews
- ✅ Cached average ratings for performance
- ✅ Real-time review list updates

### Dashboard & Analytics
- ✅ Personalized dashboard on homepage
- ✅ Quick stats cards (total collections, movies, reviews, average rating)
- ✅ Genre distribution pie chart
- ✅ Rating distribution histogram
- ✅ Recent additions with navigation
- ✅ Top collections by movie count

### UX Enhancements
- ✅ Debounced search inputs (500ms)
- ✅ Loading states and error handling
- ✅ Mobile-responsive design
- ✅ Filter chips for genres
- ✅ Expandable sections
- ✅ Toast notifications

## Project Structure

```
copilot-course/
├── backend/
│   └── MovieApp/
│       ├── Database/
│       │   └── ApplicationDbContext.cs
│       ├── Entities/
│       │   ├── User.cs
│       │   ├── MovieCollection.cs
│       │   ├── CollectionMovie.cs
│       │   ├── MovieReview.cs
│       │   └── MovieRatingCache.cs
│       ├── Features/
│       │   ├── Auth/
│       │   │   ├── LoginEndpoint.cs
│       │   │   └── RegisterEndpoint.cs
│       │   ├── Health/
│       │   │   └── HealthCheckEndpoint.cs
│       │   ├── Library/
│       │   │   ├── GetCollectionMoviesEndpoint.cs
│       │   │   ├── GetCollectionGenresEndpoint.cs
│       │   │   ├── GetDashboardStatsEndpoint.cs
│       │   │   ├── AddMovieToCollectionEndpoint.cs
│       │   │   ├── BackfillGenresEndpoint.cs
│       │   │   └── LibraryDtos.cs
│       │   ├── Movies/
│       │   │   ├── SearchMoviesEndpoint.cs
│       │   │   └── GetMovieDetailsEndpoint.cs
│       │   └── Reviews/
│       │       ├── CreateOrUpdateReviewEndpoint.cs
│       │       ├── GetMovieReviewsEndpoint.cs
│       │       └── ReviewDtos.cs
│       ├── Migrations/
│       ├── Services/
│       │   └── OmdbApiService.cs
│       ├── Program.cs
│       └── appsettings.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AddToCollectionButton.tsx
    │   │   ├── AverageRating.tsx
    │   │   ├── CollectionFilters.tsx
    │   │   ├── Pagination.tsx
    │   │   ├── ReviewsList.tsx
    │   │   └── WriteReviewModal.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── SearchPage.tsx
    │   │   ├── MovieDetailsPage.tsx
    │   │   ├── CollectionsPage.tsx
    │   │   ├── CollectionDetailsPage.tsx
    │   │   └── MyReviewsPage.tsx
    │   ├── services/
    │   │   ├── authService.ts
    │   │   ├── movieService.ts
    │   │   ├── libraryService.ts
    │   │   └── reviewService.ts
    │   ├── types/
    │   │   ├── auth.types.ts
    │   │   ├── movie.types.ts
    │   │   ├── library.types.ts
    │   │   └── review.types.ts
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## Prerequisites

- .NET 10.0 SDK or later
- Node.js 18 or later
- SQL Server (Local instance)
- OMDB API Key (get one free at https://www.omdbapi.com/apikey.aspx)

## Getting Started

### Backend Setup

1. Navigate to the backend project:
   ```bash
   cd backend/MovieApp
   ```

2. Configure OMDB API Key in `appsettings.json`:
   ```json
   "OmdbApi": {
     "ApiKey": "your-api-key-here",
     "BaseUrl": "https://www.omdbapi.com/"
   }
   ```

3. Apply database migrations:
   ```bash
   dotnet ef database update
   ```

4. Run the backend server:
   ```bash
   dotnet run
   ```

The backend API will be available at:
- HTTPS: https://localhost:5001
- HTTP: http://localhost:5000

API endpoints include:
- Health: `/api/health`
- Auth: `/api/auth/register`, `/api/auth/login`
- Movies: `/api/movies/search`, `/api/movies/{imdbId}`
- Collections: `/api/library/collections`
- Reviews: `/api/reviews`
- Dashboard: `/api/library/dashboard/stats`

### Frontend Setup

1. Navigate to the frontend project:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend application will be available at: http://localhost:5173

## Configuration

### Database Connection

The default connection string is configured in `backend/MovieApp/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=MovieAppDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
}
```

Adjust the connection string based on your local SQL Server setup.

### JWT Configuration

JWT settings are in `appsettings.json`. For production, make sure to:
- Use a strong secret key (at least 32 characters)
- Store secrets in environment variables or secure vaults
- Configure appropriate token expiration times

### CORS

The backend is configured to allow requests from `http://localhost:5173` (frontend port). Update this in `Program.cs` if you change the frontend port.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Movies
- `GET /api/movies/search?query={query}` - Search movies by title
- `GET /api/movies/{imdbId}` - Get detailed movie information
- `GET /api/movies/{imdbId}/stats` - Get movie statistics (average rating, review count)

### Collections
- `POST /api/library/collections` - Create new collection
- `GET /api/library/collections` - Get user's collections
- `GET /api/library/collections/{id}/movies` - Get movies in collection (with filters)
- `POST /api/library/collections/{id}/movies` - Add movie to collection
- `DELETE /api/library/collections/{id}/movies/{imdbId}` - Remove movie from collection
- `DELETE /api/library/collections/{id}` - Delete collection
- `GET /api/library/collections/{id}/genres` - Get unique genres in collection
- `GET /api/library/movies/{imdbId}/collections` - Get collections containing a movie

### Reviews
- `POST /api/reviews` - Create or update review
- `GET /api/reviews/my-review/{imdbId}` - Get user's review for a movie
- `GET /api/reviews/movie/{imdbId}` - Get all reviews for a movie
- `GET /api/reviews/my-reviews` - Get all user's reviews
- `DELETE /api/reviews/{imdbId}` - Delete user's review

### Dashboard
- `GET /api/library/dashboard/stats` - Get dashboard statistics

### Utilities
- `POST /api/library/backfill-genres` - Backfill genre data for existing movies

## Database Schema

### Users
- Id (int, PK)
- Email (string, unique)
- PasswordHash (string)
- CreatedAt (datetime)

### MovieCollections
- Id (int, PK)
- UserId (int, FK)
- Name (string)
- CreatedAt (datetime)
- Unique constraint: (UserId, Name)

### CollectionMovies
- Id (int, PK)
- CollectionId (int, FK)
- ImdbId (string)
- Title (string)
- Year (string)
- Poster (string)
- Type (string)
- Genre (string, nullable)
- AddedAt (datetime)
- Unique constraint: (CollectionId, ImdbId)

### MovieReviews
- Id (int, PK)
- UserId (int, FK)
- ImdbId (string)
- Rating (int, 1-10)
- ReviewText (string, nullable)
- CreatedAt (datetime)
- UpdatedAt (datetime)
- Unique constraint: (UserId, ImdbId)

### MovieRatingCache
- ImdbId (string, PK)
- AverageRating (decimal)
- ReviewCount (int)
- LastUpdated (datetime)

## Development

### Backend

- All API endpoints follow the Vertical Slice pattern and are located in the `Features` folder
- Each feature contains its endpoint definitions, handlers, and related logic
- Entity models are in the `Entities` folder
- Database context is in `Database/ApplicationDbContext.cs`
- OMDB API integration is in `Services/OmdbApiService.cs`

### Frontend

- React components are organized in the `src/components` folder
- Page components are in `src/pages`
- API service calls are in `src/services`
- TypeScript types/interfaces are in `src/types`
- Authentication is managed via AuthContext
- Routing is handled by React Router DOM

### Key Features Implementation

**Filtering & Pagination**
- Server-side filtering and sorting using LINQ
- Dynamic query building with System.Linq.Dynamic.Core
- URL-based filter state persistence
- Debounced input fields (500ms) for better UX

**Review System**
- Optimistic UI updates with error rollback
- Cached aggregate ratings for performance
- Automatic cache updates on review changes
- Real-time list refresh with React key prop

**Dashboard**
- Server-side aggregation queries
- SVG-based pie chart for genres
- Histogram visualization for rating distribution
- Clickable navigation to related content

## Utilities

### Backfill Genres
If you have existing movies in collections without genre data, use the backfill endpoint:

```bash
POST http://localhost:5000/api/library/backfill-genres
Authorization: Bearer {your-jwt-token}
```

This will fetch genre information from OMDB for all movies with missing genre data.

## Current Status

This is a fully functional movie collection management application with:
- ✅ Complete authentication system
- ✅ Movie search and details
- ✅ Collection management with filtering
- ✅ Review and rating system
- ✅ Dashboard with analytics
- ✅ Mobile-responsive design
- ✅ Comprehensive error handling

## Future Enhancements

Potential features to implement:
- Social features (follow users, share collections)
- Movie recommendations based on ratings
- Export collections to various formats
- Advanced search filters
- Collection sharing and collaboration
- User profiles with avatars
- Dark/light theme toggle
- Watchlist functionality
- Movie trailers integration
