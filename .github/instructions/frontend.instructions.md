# Frontend Instructions

Applies to `frontend/src/**` and frontend test files.

## 1) Stack and Structure

- Keep React 18 + TypeScript + Vite + TailwindCSS conventions.
- Maintain separation of concerns:
	- `pages` for route-level screens,
	- `components` for reusable UI,
	- `services` for HTTP/API logic,
	- `contexts` for global auth/session state,
	- `types` for API/domain contracts.
- Prefer focused, composable components.

## 2) Contract and Typing Discipline

- Update and reuse types in `src/types/*.types.ts` when backend DTOs change.
- Keep service return types explicit and aligned with backend payloads.
- Avoid hidden assumptions about API response shape.
- Do not call `fetch` directly in UI when an existing service layer covers that domain.

## 3) Service Layer Conventions

- Follow existing patterns in `src/services/*`:
	- keep `API_BASE_URL` usage consistent,
	- read auth token from `localStorage.getItem("authToken")` for protected routes,
	- parse error responses and throw `new Error(error.message || "<fallback>")`.
- Keep endpoint paths compatible with backend routes.
- Preserve auth storage keys: `authToken`, `authUser`.

## 4) UI and UX Expectations

- For async flows, provide loading/error/empty handling.
- Keep interactions predictable and accessible (clear labels, disabled states, semantic controls).
- Reuse current Tailwind patterns before introducing new style variants.
- Preserve responsiveness across core pages (dashboard, search, collections, movie details, reviews).

## 5) Auth and Navigation

- Continue using `AuthContext` and `ProtectedRoute` patterns.
- Handle auth failures/expired sessions by transitioning safely to logged-out state.
- Avoid introducing new global state libraries unless explicitly requested.

## 6) Testing Requirements

- Use existing Vitest + React Testing Library setup in `src/test/setup.ts`.
- Keep tests aligned with real contracts (exports, props, async behavior).
- Mock at API/service boundaries rather than internal implementation details.
- For changed behavior, add or update tests in:
	- `src/services/__tests__` for service logic,
	- relevant component/page tests for user-visible behavior.

## 7) Completion Checklist

- Types, services, and UI stay contract-consistent.
- Async states include loading + error handling.
- Relevant tests pass (`npm run test` in `frontend`).
- No unrelated styling/system or architecture churn.
