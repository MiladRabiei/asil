# Asil — EV Charging PWA

Built from the B2B boilerplate (`mother-react-repo`), merging:

1. The PWA layer ported from the exchange-confirmation app.
2. A separate infra-focused EV PWA spike ("v5") — map/offline/PWA-lifecycle
   architecture were meaningfully more correct there and were adopted here.
3. Product screens (wallet, branch detail, home, scan) built against the
   company's actual boilerplate conventions (Apollo `_service` pattern,
   AuthContext/roles, shadcn UI), which the spike didn't have at all.
4. Several review/refactor passes (see "Changelog" below) that fixed real
   bugs and consolidated the data-fetching architecture onto React Query.

This is a **structure-first pass**: screens are wired end-to-end against
mock data so the app runs and is fully click-through today, but real
endpoints, payments, device firmware integration, and final visual design
for several screens are still open (see "Placeholder screens" below).

## Branding

App name is **"Asil"** (matches the reference product screenshot). Keep
`app/layout.tsx` metadata, `app/manifest.ts`, `AppTopBar`, and
`lib/seo/CreateMetaData.ts`'s `SITE_NAME` in sync if this changes.

## Architecture

- **PWA**: manifest, service worker (network-first navigation / cache-first
  static assets / never caches `/api/*`, cache-versioned with cleanup),
  install prompt, push subscribe/unsubscribe/topics (mocked via local Route
  Handlers — see `NEXT_PUBLIC_PUSH_MOCK`), SW-update banner (skip-waiting
  flow), foreground refetch on `visibilitychange`/`pageshow`,
  on-screen-keyboard inset tracking, network-status banner. Icons in
  `public/icons` are placeholders.
- **Map**: `src/components/map` — Neshan's _official_ OpenLayers SDK
  (`@neshan-maps-platform/react-openlayers`), not a generic Leaflet tile
  hack. Supports POI/traffic layers, viewport-bounds emission on `moveend`,
  portal-based popups, and a live user-position marker (with accuracy
  circle) + "my location" recenter button. Navigation deep-links
  (`src/lib/map/neshan.ts`) confirmed against Neshan's official docs for the
  point/Android/web case; the iOS routing scheme is unconfirmed — smoke-test
  on a real device.
- **Station discovery**: query hooks live in `src/shared/_service/hook.query.tsx`
  (the project's existing convention — see "Station query architecture"
  below), backed by adapters in `src/lib/stations`. Two query shapes,
  used **together** on the main Map screen:
  - **nearby** — GPS + radius, centers the map and shows what's around the
    user immediately on open.
  - **viewport** — map bounds, takes over once the user pans/zooms away
    from their own position, so browsing stations elsewhere (planning a
    trip to another city) actually shows something.
    Results from both are merged (deduped by id) into one marker set. A
    national charging network can have thousands of stations — this is why
    neither mode ever fetches "all stations." Viewport queries are quantized
    to a coarse grid (+ zoom) so panning slightly doesn't re-fetch. Both are
    persisted to IndexedDB (`src/lib/offline`) for offline/reload support, with
    a 5-minute staleness window. Mock discovery adapters
    (`src/lib/stations/mock.ts`) make the map fully functional today without a
    backend — see `NEXT_PUBLIC_USE_MOCK_EV_DATA` in `.env.example`.
- **Screens** (`src/app/(app)/`): Home (quick actions + nearby list), Map
  (full-screen branch map), Branch detail (availability, out-of-service
  state, notify-me bell, navigate button), Scan (camera + manual code
  entry), Wallet, Account, Notifications (placeholder), Support
  (placeholder).
- **QR scanning**: `qr-scanner` npm package rather than a
  Barcode-Detection-API based scanner — decodes identically across browsers
  instead of silently falling back to a heavier WASM polyfill on
  Safari/iOS, the platform this app cares most about. Camera permission is
  only requested on an explicit tap (`useQrScanner.start()`), not on mount.
- **Auth**: phone/OTP/password flow reused as-is from the boilerplate; the
  seller-onboarding KYC step was removed (not relevant to an EV consumer
  app).
- **Roles**: collapsed from the B2B seller/parent-company/branch model down
  to a single `USER` role — the role-guard pattern itself is kept in case an
  operator role shows up later.

### Station query architecture

`src/shared/_service/hook.query.tsx` is intentionally restricted to **GET
query definitions**. It must not own React state/effects, browser event
listeners, GPS movement logic, or UI orchestration.

The current split is:

- `hook.query.tsx`
  - `useGetCurrentUser`
  - `useGetBranch`
  - `useGetWallet`
  - `useNearbyStationsQuery`
  - `useViewportStationsQuery`
  - React Query keys/options/query functions only.
- `src/lib/stations/useNearbyStations.ts`
  - owns the 3 km GPS movement anchor rule;
  - composes the nearby GET query;
  - exposes UI-friendly loading/offline metadata.
- `src/lib/stations/useViewportStations.ts`
  - composes the viewport GET query;
  - exposes UI-friendly loading/offline metadata.
- `src/lib/stations/cachedDiscovery.ts`
  - owns the network -> IndexedDB fallback;
  - never treats cached station data as authoritative live charging state.
- `src/lib/stations/{nearby,viewport,discovery,mock}.ts`
  - provider/backend adapters only; no React state.
- `src/lib/offline`
  - IndexedDB persistence only.

React Query owns request lifecycle, deduplication, in-memory caching and
cancellation through `queryFn`'s `signal`. The discovery adapters already
perform bounded network retries, so React Query retries remain disabled for
station discovery to avoid compounded retry delays.

The nearby query key uses a normalized three-decimal GPS anchor. The anchor
only advances after the device moves at least 3 km, which prevents GPS jitter
from generating a request for every location update.

Viewport queries use `viewportCacheKey`, which quantizes the map bounds to a
coarse grid and includes the current zoom. `NeshanMap` emits both bounds and zoom
on `moveend`, and `BranchMap` carries both values into the viewport query. Small
pans therefore reuse the same query/cache entry while meaningful viewport or zoom
changes fetch new data.

### Offline data policy

There are **two separate caching concerns**:

1. **PWA shell/static assets** — cached by the service worker so the app can
   start offline.
2. **Station discovery data** — persisted in IndexedDB so previously visited
   map areas can be displayed after reload/offline.

The following are **never used as offline truth**:

- wallet balance;
- charging session state;
- payment/top-up state;
- authentication/OTP state;
- live connector availability.

Station cache is bounded to 100 records and retained for up to 24 hours.
React Query considers station data stale after 5 minutes. The 5-minute value is
a freshness policy, not permission to delete the persisted record immediately:
an older station snapshot can still be shown offline with an explicit stale
state.

`navigator.onLine` is UI information only. A real station request still
attempts the backend and falls back to IndexedDB on failure, which is important
when the device reports "online" but the backend or internet path is actually
unreachable.

### Neshan handoff contract

Asil does **not** calculate or own turn-by-turn navigation.

When the user taps the station navigation action:

1. Asil validates the selected station coordinates.
2. Asil hands the point to Neshan using the point/location URL.
3. Asil does **not** request current GPS for this action.
4. Neshan owns the place UI and its own `مسیریابی` action.
5. The user may navigate inside Neshan or return to Asil.

`openNeshanNavigation(destination, origin)` remains in the provider adapter only
for a future provider-owned routing requirement; the current station UI uses
`openNeshanLocation`.

### PWA update lifecycle

The service worker is generated after `next build` using `.next/BUILD_ID`.
That build ID becomes the cache version. `PwaProvider` registers the worker with
`updateViaCache: 'none'`, and the update component can activate a waiting worker
after explicit user confirmation.

Required regression scenario:

- install version A;
- deploy version B;
- do **not** clear site data;
- reload/open the existing PWA;
- version B's worker must be discovered and become active;
- old shell/runtime caches must be deleted;
- the app must load version B.

This must be tested in a real browser/standalone PWA before calling the PWA
update path production-ready.

Important implementation detail: the service worker **does not call `skipWaiting()`
during `install`**. A newly installed worker remains waiting until the application
explicitly sends `SKIP_WAITING` after the user accepts the update.

## Placeholder screens (no design yet)

**Wallet, Account, the map-popup (`BranchPopup`), and branch-detail
(`BranchDetail`) are deliberately minimal.** No visual design exists for
any of them yet. Each is marked with a `PLACEHOLDER PRESENTATION` comment
at the top of the file. The rule for these:

- The **data contract** is the final part — hooks (`useGetWallet`,
  `useGetBranch`), types (`IWallet`, `IChargingBranch`), and the actions
  wired to real logic (navigate, notify-bell, logout, scan-this-branch)
  should not need to change when a design lands.
- The **JSX/styling** is a plain stand-in using the app's design tokens
  (`bg-background`, `text-muted-foreground`, `border-border-primary`,
  `text-success`/`text-warning`/`text-error`, etc. — see `globals.css`),
  not bespoke colors, so it's both consistent today and trivial to replace
  wholesale later. When a real design arrives, replace the JSX inside these
  files; nothing upstream should need to change.

## Known gaps / next steps

- **Everything marked `USE_MOCK_*`** (`hook.query.tsx`, `hook.mutation.tsx`,
  `ev.service.ts`, `lib/stations/discovery.ts`) reads from the single
  `runtimeConfig` object (`src/config/runtime.config.ts`) — flip
  `NEXT_PUBLIC_USE_MOCK_EV_DATA` / `NEXT_PUBLIC_USE_MOCK_USER` /
  `NEXT_PUBLIC_PUSH_MOCK` to `false` once real endpoints exist. **Defaults
  to `true` only in development** (`NODE_ENV`-derived) — production builds
  default to real endpoints unless explicitly overridden, so a missing env
  var in prod fails loudly instead of silently serving mock data.
- **Viewport station cache staleness** is a flat 5-minute window — confirm
  the real policy once station update frequency is known.
- **Charging session start/stop** are defined in `route.api.ts` but not
  wired to any UI yet — Scan currently resolves a code to a branch and hands
  off to the branch page.
- **Wallet top-up** button is a stub — no payment gateway wired in.
- **Push mock backend** (`src/app/api/v1/push/client/*`) is in-memory only —
  delete once a real backend ships these routes.
- **iOS Neshan point handoff** (`neshan://?ll=...`) is unconfirmed by
  official docs — verify the installed-app and no-app cases on a real device.
- Marker/manifest icons are placeholder art, not final.
- See "Placeholder screens" above for Wallet/Account/branch-popup/detail.

## Backend integration contract

Confirm these with the backend before replacing any mock:

**Already assumed by the frontend (confirm these match):**

- Viewport discovery accepts `north/south/east/west` (+ optional `zoom`).
- Nearby discovery accepts `lat/lng` + `radiusMeters`.
- Navigation is a hand-off to the Neshan app/website; turn-by-turn
  navigation is not implemented in-app.
- Cached station data is always treated as potentially stale, never a
  substitute for live charging-state truth.
- Map/list responses should stay lightweight (position, identity, name,
  compact availability summary) — detailed connector/session/pricing data
  belongs on the branch-detail/session screens, not the map response.

**Pending backend confirmation:**

- Branch summary/list response shape, pagination/viewport result limits.
- Branch detail response and connector schema.
- Live availability/status update frequency and authoritative status values.
- Charging session start/stop semantics and async state transitions.
- Wallet top-up/payment creation and verification flow.
- Push subscription/topic API and server-side notification ownership.

## Engineering & QA checklist

### Completed in this pass

- [x] `hook.query.tsx` contains GET query definitions only.
- [x] Nearby GPS movement state moved out of the query-definition layer.
- [x] Station cache fallback moved out of `hook.query.tsx`.
- [x] Nearby and viewport discovery remain separate and are merged on the map.
- [x] Station IndexedDB retention is bounded (100 records / 24 hours).
- [x] Neshan station actions no longer request current GPS before handoff.
- [x] Neshan point handoff is separated from provider-owned routing.
- [x] Invalid Neshan coordinates are rejected before handoff.
- [x] Offline station reads do not depend on React Query's default online
      network mode.
- [x] Service-worker install no longer self-activates; update activation is
      reserved for explicit `SKIP_WAITING` messages.
- [x] Viewport zoom is carried from `NeshanMap` into the viewport query/cache key.
- [x] Removed the dead `useGetBranches` query and its unused list-route/mock function.
- [x] Removed stray production `console.log` calls.
- [x] Wallet/charging/auth data remain outside the station offline cache.

### Must be verified with a browser/device

- [ ] Offline reload shows the previously cached map/stations.
- [ ] Online -> offline -> online transitions recover without a manual reload.
- [ ] Backend unavailable while `navigator.onLine === true` falls back to station
      cache.
- [ ] GPS permission denied still allows manual map browsing via viewport queries.
- [ ] GPS jitter below 3 km does not trigger nearby requests.
- [ ] A movement of >= 3 km changes the nearby query anchor.
- [ ] Rapid pan/zoom cancels obsolete viewport requests.
- [ ] Duplicate stations from nearby + viewport render once.
- [ ] Empty, malformed and unexpectedly large station responses are handled.
- [ ] Neshan handoff works on Android with Neshan installed.
- [ ] Neshan handoff degrades correctly when Neshan is not installed.
- [ ] Neshan handoff works on iOS with the installed app.
- [ ] Desktop/web Neshan point handoff works.
- [x] Asil does not request GPS when the Neshan button is tapped.
- [ ] Neshan's own place UI exposes its own routing action as expected.
- [ ] PWA version A -> B updates without clearing storage/site data (code path fixed; runtime verification still required).
- [ ] Waiting service worker activation reloads the page exactly once.
- [ ] Failed service-worker installation does not block application startup.
- [ ] Multiple tabs do not leave stale workers/caches unexpectedly active.
- [ ] Standalone PWA behaves the same as browser mode for map/cache/update flows.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Production build has all mock flags explicitly configured.

### Production blockers

- [ ] Confirm the real GraphQL schema and replace REST GET adapters without
      inventing field/envelope names.
- [ ] Confirm authoritative live charging-status semantics.
- [ ] Wire charging start/stop and verify asynchronous state transitions.
- [ ] Wire wallet top-up/payment flow.
- [ ] Replace push mock routes with the production push API.
- [ ] Replace placeholder icons and placeholder presentation.
- [ ] Perform real-device Neshan smoke tests for Android/iOS/PWA.
- [ ] Perform a controlled service-worker A -> B deployment test without
      clearing browser storage.

## Changelog

Condensed history of the review/refactor passes this project has been
through, newest first. Kept here instead of separate per-pass notes files
so it doesn't go stale.

- **Separated GET definitions from station orchestration** — React Query GET
  definitions remain in `hook.query.tsx`, while GPS anchor state, network UI
  state and cache fallback live under `lib/stations`. This restores the
  project's `hook.query.tsx` convention without losing React Query lifecycle
  management.
- **Fixed a real compile error**: `useViewportStations` referenced
  `IViewportStationQuery` without importing it.
- **Restored viewport-based map browsing.** An interim pass made the main
  Map screen GPS-only ("nearby" query alone), which meant panning to a
  different area showed nothing. The map now runs nearby + viewport queries
  together, merged by id — GPS centers the map and shows nearby stations
  immediately, panning elsewhere loads that area via the viewport query.
- Added live user-location marker + accuracy circle + "my location" button
  on the map (`useUserLocation`, continuous GPS watch, refreshes on
  tab/app resume).
- Removed `useWatchLocation` — dead code, fully superseded by
  `useUserLocation`, never actually called anywhere.
- Centralized every mock/real toggle into one `runtimeConfig` object;
  several `USE_MOCK_*` constants were previously hardcoded `true` and
  ignored their env vars entirely. Production now defaults mocks to `false`
  (was defaulting to `true` unconditionally, i.e. a missing env var in prod
  would have silently served mock data to real users).
- Fixed station-query request cancellation: viewport/nearby query changes
  now actually abort the previous in-flight request (previously designed
  for but never wired up); failed requests no longer "poison" the
  movement/viewport cache for the full stale window; a caller-cancelled
  request is never retried; retry-delay abort listeners no longer leak.
- Viewport cache keys now include zoom when supplied.
- `npm run lint` now invokes ESLint directly (`next lint` is
  deprecated/removed as of Next 15+); added `npm run typecheck`; aligned
  `eslint-config-next` with the Next 16 major actually in use.
- Removed dead code left over from the original B2B boilerplate: an
  unused, fully-commented-out `sendPush.ts`, and unused GSM
  guarantee/KYC validation schemas.
- Fixed leftover GSM-boilerplate branding strings (`Header` logo alt text,
  SEO `SITE_NAME`) that survived the initial "Asil" rebrand.
- Replaced ad-hoc Tailwind colors (`bg-green-500`, raw `black`/`gray`
  classes) in the map popup and branch-detail status badges with the app's
  actual design tokens (`text-success`/`text-warning`/`text-error`,
  `bg-background`, `border-border-primary`) for consistency and so a future
  reskin doesn't require hunting down bespoke colors.
- Bugs found and fixed while porting the original "v5" infra spike: a
  broken import in its `lib/pwa/install.ts` (referenced a `./detect` module
  that didn't exist), mismatched export names in its `lib/pwa/index.ts`,
  and a broken type import in its `useWatchLocation.ts`. Its `WalletPage`
  / `BranchDetails` were literal one-line stubs ("pending requirements");
  this repo has full (if placeholder-styled) UI for both instead. It also
  had no mock/fallback data path for the map, which rendered nothing
  without a real backend — this repo's mock discovery adapters fix that.

## Env vars

See `.env.example` — Neshan map key + defaults, station discovery
endpoints, mock toggles, VAPID push keys, API base URL.

## Running it

```bash
npm install
cp .env.example .env
npm run dev
```

Before merging any change to this project, run:

```bash
npm run typecheck
npm run lint
npm run build
```
