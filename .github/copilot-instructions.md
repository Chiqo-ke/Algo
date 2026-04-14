# Copilot Instructions for Algo Frontend

## Build, lint, and test commands

Use npm in the repository root (`C:\Users\nyaga\Documents\Algo`).

| Task | Command |
|---|---|
| Install dependencies | `npm install` |
| Run dev server | `npm run dev` |
| Build production bundle | `npm run build` |
| Preview production build | `npm run preview` |
| Lint entire repo | `npm run lint` |
| Lint a single file (closest equivalent to single-test execution) | `npx eslint src\pages\Dashboard.tsx` |
| Type-check (not scripted, but used in docs/workflow) | `npx tsc --noEmit` |

There is currently no automated test runner configured in `package.json` (no `test` script, no Jest/Vitest/Cypress/Playwright setup).

## High-level architecture

### App shell and routing
- Entry point is `src/main.tsx` → `src/App.tsx`.
- `App.tsx` composes global providers in this order: `QueryClientProvider`, `TooltipProvider`, `BrowserRouter`, `TutorProvider`, `AuthProvider`, then route tree.
- Public routes: `/`, `/login`, `/register`, `/legal`, `/docs`, `/auth/callback`, `/error/:code`.
- Authenticated routes are wrapped in `ProtectedRoute` (e.g., `/dashboard`, `/strategy-builder`, `/strategy`, `/backtesting/:strategyId`, `/live-trading`, `/settings`, `/demo`).
- The root route (`/`) is auth-aware: authenticated users are redirected to `/dashboard`, unauthenticated users see the landing page.

### Data/API layering
- API endpoint constants and HTTP behavior live in `src/lib/api.ts`.
- Feature-level API wrappers live in `src/lib/services.ts` and `src/lib/productionServices.ts`.
- Page/components generally call service methods instead of calling `fetch` directly (exceptions exist, e.g. parts of `StrategyBuilder.tsx` and `productionApi.ts`).
- Domain contracts are centralized in `src/lib/types.ts`.

### Auth and session lifecycle
- Auth state is managed by `AuthProvider` in `src/hooks/useAuth.tsx`.
- Tokens are stored in `localStorage` (`access_token`, `refresh_token`).
- `api.ts` handles 401 centrally, dispatches a `session-expired` browser event, clears tokens, and redirects to `/login` (except on public paths).
- `SessionExpirationHandler` (mounted once in `App.tsx`) listens for `session-expired` and shows a destructive toast.

### Strategy generation and async jobs
- Strategy generation UX in `src/pages/StrategyBuilder.tsx` uses enqueue + poll semantics.
- Polling logic is centralized in `src/lib/jobPoller.ts` (`pollJob` against `/api/jobs/<id>/`).
- Additional iterative code-generation/fix flow exists in `src/lib/codeGenerationService.ts` using strategy + production validation endpoints.

## Key conventions in this repository

1. **Service return shape is `{ data?, error? }` instead of throwing by default**  
   API helpers (`apiGet`, `apiPost`, etc.) and most service methods return this shape. Call sites usually check `error` and branch explicitly.

2. **Keep endpoint definitions centralized in `API_ENDPOINTS`**  
   New backend integrations should add paths in `src/lib/api.ts` first, then expose typed wrappers in `services.ts`/`productionServices.ts`.

3. **Use the logger categories instead of ad-hoc console logging**  
   Import `logger` from `src/lib/logger.ts` and log through category methods (`logger.auth`, `logger.api`, `logger.strategy`, etc.) to preserve structured telemetry behavior.

4. **Route protection pattern is provider + wrapper based**  
   Authentication assumptions should align with `AuthProvider` + `ProtectedRoute`; avoid duplicating auth checks in each page.

5. **Use the `@` import alias for app code**  
   `vite.config.ts` maps `@` to `src`, and the codebase consistently uses `@/…` imports.

6. **Environment variable naming is not fully uniform across modules**  
   Most API code uses `VITE_API_BASE_URL` (`src/lib/api.ts`), while `productionApi.ts` currently reads `VITE_API_URL`. Preserve existing behavior when editing and be explicit about which variable a module reads.

7. **Dev server port is set in Vite config**  
   `vite.config.ts` sets `server.port` to `8081`. Prefer config/runtime values over older docs that mention `5173`.
