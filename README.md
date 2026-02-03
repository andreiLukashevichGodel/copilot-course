# MovieApp

A movie rating application that allows users to add their favorite movies to their profile and rate them.

## Tech Stack

### Backend
- **Framework**: ASP.NET Core with Minimal API
- **Architecture**: Vertical Slice pattern
- **Database**: SQL Server (Local)
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **API Design**: RESTful endpoints organized in Features folder

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Port**: 5173

### External Services
- **Movie Data**: imdbapi.dev (free API)

## Project Structure

```
copilot-course/
├── backend/
│   └── MovieApp/
│       ├── Features/
│       │   └── Health/
│       ├── Migrations/
│       ├── ApplicationDbContext.cs
│       ├── Program.cs
│       └── appsettings.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   └── HomePage.tsx
    │   ├── services/
    │   ├── types/
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    └── package.json
```

## Prerequisites

- .NET 8.0 SDK or later
- Node.js 18 or later
- SQL Server (Local instance)

## Getting Started

### Backend Setup

1. Navigate to the backend project:
   ```bash
   cd backend/MovieApp
   ```

2. Apply database migrations:
   ```bash
   dotnet ef database update
   ```

3. Run the backend server:
   ```bash
   dotnet run
   ```

The backend API will be available at:
- HTTPS: https://localhost:5001
- HTTP: http://localhost:5000

Test the health endpoint:
- https://localhost:5001/api/health

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

## Development

### Backend

- All API endpoints follow the Vertical Slice pattern and are located in the `Features` folder
- Each feature contains its endpoint definitions, handlers, and related logic
- The health check endpoint is available at `/api/health`

### Frontend

- React components are organized in the `src/components` folder
- Page components are in `src/pages`
- API service calls will be in `src/services`
- TypeScript types/interfaces will be in `src/types`

## Current Status

This is the initial version of the application with:
- ✅ Backend API with health check endpoint
- ✅ Database setup with Entity Framework migrations
- ✅ JWT authentication configuration (not yet implemented)
- ✅ CORS configuration for frontend communication
- ✅ Frontend with empty main page

## Next Steps

- Implement user registration and authentication
- Create movie-related features (browse, search, rate)
- Integrate with imdbapi.dev for movie data
- Build movie list and rating components
- Add user profile management
