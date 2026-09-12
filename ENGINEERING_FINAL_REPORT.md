# Asil Engineering Final Pre-Endpoint Report

## Scope

This pass completes the frontend engineering changes that can be made before the real backend endpoints/schema are available.

## Latest fixes

- Removed unconditional `self.skipWaiting()` from the service-worker `install` handler.
- Kept `SKIP_WAITING` message handling so the application can activate a waiting worker after explicit user confirmation.
- Regenerated/updated `public/sw.js` consistently with the template by removing install-time self-activation while preserving the generated cache version.
- Wired `NeshanMap` viewport `zoom` through `BranchMap` into `useViewportStations` and `viewportCacheKey`.
- Removed unused `IChargingBranch` imports from the station orchestration hooks.
- Removed dead `useGetBranches` query, its unused list route export, and its unused mock function.
- Removed stray `console.log` calls from `MobileBottomNav` and `Pagination`.
- Updated README architecture and QA documentation to match the actual implementation.

## Validation completed in this environment

- `node --check public/sw.template.js` — PASS
- `node --check public/sw.js` — PASS
- `node --check generate-sw.mjs` — PASS
- No install-time `skipWaiting()` remains in the service-worker template.
- No requested stray `console.log` calls remain.
- No `useGetBranches`, `BRANCHES_LIST_ROUTE`, or `fetchMockBranches` references remain.

## Environment limitation

The repository does not contain installed dependencies in this environment, and the environment cannot complete dependency installation. Therefore these are intentionally **not** claimed as passed here:

- `npm run typecheck`
- `npm run lint`
- `npm run build`

Run those three commands in the normal development/CI environment after dependencies are installed.

## Runtime verification still required

These require a real browser/device or real backend:

- PWA A -> B update without clearing site data.
- Multiple-tab service-worker waiting/activation behavior.
- Standalone PWA update behavior.
- Offline/online transitions.
- Android/iOS Neshan handoff.
- Real backend response/error behavior.
- GraphQL integration after the backend schema is provided.
