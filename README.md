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
- **Map**: `src/components/map` — Neshan's *official* OpenLayers SDK
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

Station discovery follows the project's `hook.query.tsx` convention rather
than a second, parallel data-fetching system. **React Query owns request
lifecycle, deduplication, retries, cancellation (via `queryFn`'s `signal`),
and in-memory cache.** `src/lib/stations/{nearby,viewport,discovery,mock}.ts`
are infrastructure-only — they translate a provider/backend contract into
plain async functions and own zero React state. IndexedDB
(`src/lib/offline`) is the persistence layer for reload/offline support,
read/written from inside the query functions.

Two domain-specific rules live in the query hooks, not in React Query
itself:
- **Nearby** — the query anchor only changes once the device has moved past
  a configured threshold (`useNearbyStations`'s `movementThresholdMeters`),
  so GPS jitter doesn't create a new request every few meters.
- **Viewport** — the query key is the quantized viewport cell + zoom
  (`viewportCacheKey`), so panning slightly doesn't re-fetch, but a
  meaningfully different zoom level does.

Queries use `networkMode: 'always'` deliberately — React Query's default
(`'online'`) would skip the `queryFn` entirely while offline, which would
mean the IndexedDB cache read inside it never runs. `retry: false` at the
React Query level is also deliberate: the discovery adapters' own
`resilientFetch` already retries transient failures with backoff, so
React Query retrying on top would compound delays.

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
- **iOS Neshan routing deep link** (`neshan://?destination=...`) is
  unconfirmed by official docs — verify on a real device.
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

## Changelog

Condensed history of the review/refactor passes this project has been
through, newest first. Kept here instead of separate per-pass notes files
so it doesn't go stale.

- **Consolidated station discovery onto React Query** — was previously a
  hand-rolled parallel hook (`lib/stations/hooks.ts`, manual request-id refs
  and `AbortController` management) duplicating what React Query already
  does. Moved into `hook.query.tsx` (see "Station query architecture"
  above); `lib/stations/hooks.ts` deleted.
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
