# Backend Instructions

Applies to `backend/MovieApp/**` and `backend/MovieApp.Tests/**`.

## 1) Architecture and File Placement

- Keep ASP.NET Core minimal API + vertical slice structure under `Features/{Feature}`.
- For new behavior, add/update endpoint classes in the owning feature folder and keep DTOs in that same slice (`*Dtos.cs`).
- Endpoint classes should stay static and expose `Map<Action>Endpoint` extension methods.
- Every new endpoint must be mapped in `Program.cs`.

## 2) Endpoint and Route Conventions

- Keep existing route families: `/api/auth`, `/api/movies`, `/api/library`, `/api/reviews`, `/api/health`.
- For protected endpoints, use both `[Authorize]` and `.RequireAuthorization()`.
- Resolve the current user from `ClaimsPrincipal` (`ClaimTypes.Email`); never trust user identity from request body/query.
- Return `Results.*` with predictable status codes:
	- `400` for validation,
	- `401` for unauthenticated,
	- `404` for missing resources,
	- `200/201` for success.

## 3) Validation and Domain Rules

- Preserve established review rules unless explicitly changed:
	- rating is `1..10`,
	- review text is `10..2000` chars when provided.
- Enforce collection ownership checks before read/write operations.
- Keep error payloads frontend-friendly (`{ message: "..." }`).

## 4) Data Access (EF Core + SQL Server)

- Use `ApplicationDbContext` and keep queries projection-first and scoped to the authenticated user when needed.
- Persist timestamps in UTC.
- Avoid N+1 query patterns and load only required data for response DTOs.
- Create migrations only for intentional schema changes; keep migration history and model snapshot consistent.

## 5) External Services

- OMDB integration should go through `OmdbApiService` (do not duplicate HTTP integration logic in endpoints).
- Handle OMDB/network failures gracefully with safe client-facing messages.

## 6) Testing Requirements

- Backend tests belong in `backend/MovieApp.Tests`.
- Follow existing xUnit + FluentAssertions patterns.
- Use `TestDbContextFactory` for in-memory EF setup.
- For each changed backend behavior, cover:
	- happy path,
	- validation failure,
	- authorization/ownership checks,
	- relevant edge cases (e.g., empty results, pagination boundaries, cache updates).

## 7) Completion Checklist

- Changes are in the correct feature slice.
- `Program.cs` maps any added endpoint.
- DTO contracts remain aligned with frontend types/services.
- Relevant tests pass (`dotnet test backend/MovieApp.Tests`).
- No unrelated refactors or migration churn.
