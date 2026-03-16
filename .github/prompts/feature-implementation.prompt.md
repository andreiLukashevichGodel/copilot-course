# Implement Feature End-to-End (MovieApp)

Use this template to implement a new feature in this repository with consistent architecture, contracts, and tests.

## Inputs

- Feature name: {{feature_name}}
- Scope: {{backend | frontend | full-stack}}
- User story: {{user_story}}
- Backend/API changes: {{required_changes_or_none}}
- Frontend/UI changes: {{required_changes_or_none}}
- Acceptance criteria:
  1. {{criterion_1}}
  2. {{criterion_2}}
  3. {{criterion_3}}
- Out of scope: {{out_of_scope_items}}

## Task

Implement this feature in the existing codebase.

1. Read and follow:
   - `.github/instructions/backend.instructions.md`
   - `.github/instructions/frontend.instructions.md`
2. Analyze existing related code before editing (feature slices, services, types, tests).
3. Implement only the requested scope with minimal, focused changes.
4. If backend contracts change, update frontend types/services and affected UI behavior.
5. Add/update tests for all changed behavior:
   - Backend: xUnit tests in `backend/MovieApp.Tests`
   - Frontend: Vitest/RTL tests in `frontend/src`
6. Run relevant tests for touched areas and report results.

## Constraints

- Keep backend vertical-slice structure under `backend/MovieApp/Features`.
- Keep frontend HTTP logic in `frontend/src/services`.
- Preserve existing auth token handling and error payload pattern `{ message: string }`.
- Do not introduce unrelated refactors, architecture churn, or visual system changes.

## Expected Output

Provide:
- A short execution plan
- Implemented changes summary
- Files changed
- Test commands run + outcomes
- Any follow-up or known limitations
