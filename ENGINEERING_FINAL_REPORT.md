Asil Engineering Final Pre-Endpoint Report

Scope

This pass covers the frontend engineering work that can be completed before
the real backend endpoints/schema are available, with the current source of
truth being the Serwist-based PWA architecture in this repository.

Current PWA architecture

src/app/sw.ts is the service-worker source.

src/app/serwist/[path]/route.ts generates the worker route through
createSerwistRoute.

PwaProvider uses SerwistProvider with /serwist/sw.js.

Navigation uses NetworkFirst, static /icons and /splash assets use
CacheFirst, and document navigation has an /offline.html fallback.

The service worker keeps skipWaiting: false. Activation is controlled by
the application instead of calling skipWaiting() during installation.

ServiceWorkerUpdate checks for updates on startup, foreground resume, and
online recovery. A waiting worker is activated automatically when no
React Query mutation is running. If a mutation is active, activation waits
until the mutation cache reports that the mutations have finished.

Once the new worker takes control, the current page reloads so the user runs
the new application version.

Latest fixes

Removed the old custom service-worker architecture from the current source.

Kept Serwist as the only service-worker implementation.

Changed service-worker update handling so normal releases do not require a
DevTools Skip waiting action.

Added mutation-cache monitoring so a waiting worker is activated immediately
after an active mutation finishes instead of waiting for another visibility
or online event.

Kept skipWaiting: false in src/app/sw.ts so activation remains
application-controlled.

Fixed the push subscription hook so a missing
NEXT_PUBLIC_VAPID_PUBLIC_KEY fails explicitly instead of using a non-null
assertion and passing an undefined key to the Push API.

Identified stale iOS/iPadOS splash references in layout.tsx; only existing
splash assets should be referenced until the missing exact-size assets are
added.

Updated the README and this report to describe the current Serwist
architecture instead of the removed custom public/sw.js workflow.

Push notification status

The browser-side subscription flow is implemented:

Check Push API / Notification / Service Worker support.

On iOS, require standalone Home Screen mode.

Request notification permission from the user action that starts
subscription.

Create the Push API subscription with the public VAPID key.

Send endpoint + p256dh + auth to the backend mutation.

Remove the browser subscription and backend record on unsubscribe.

The local mock routes can be used for development. Production still requires:

a real NEXT_PUBLIC_VAPID_PUBLIC_KEY;

server-side VAPID private-key handling;

a production push-subscription API;

actual Web Push delivery from the backend;

iOS/iPadOS real-device verification.

iOS / iPadOS status

Implemented:

standalone PWA detection, including iPadOS desktop-style user agents;

native browser geolocation permission;

native browser notification permission;

standalone-only push subscription behavior for iOS;

foreground/resume refresh behavior.

Still required:

verify every referenced Apple startup image exists;

test install/update behavior on real iPhone and iPad devices;

test push permission and delivery on supported iOS/iPadOS versions;

test Neshan installed-app and browser fallback behavior on iOS.

Validation

Run in the normal development/CI environment:

npm run typecheck
npm run lint
npm run build

The following runtime scenarios must also be tested manually:

PWA version A -> B update without clearing site data.

No DevTools Skip waiting action.

Update while a React Query mutation is running.

Update immediately after that mutation finishes.

Multiple tabs with an old and new worker.

Standalone PWA update behavior.

Offline reload and online recovery.

Cached station discovery while the backend is unreachable.

Native location permission denied + manual map browsing.

Push subscribe/unsubscribe.

iOS/iPadOS push in standalone mode.

Android and iOS Neshan handoff.

Known production blockers

Confirm the real backend/GraphQL schema before replacing the current
discovery adapters.

Confirm authoritative charging availability/status semantics.

Wire charging start/stop and verify asynchronous state transitions.

Wire wallet top-up/payment flow.

Replace push mock routes with the production push API.

Configure VAPID keys correctly in production.

Replace placeholder icons and placeholder presentation.

Resolve or remove any missing iOS/iPadOS startup-image references.

Perform real-device PWA update, push, location, and Neshan smoke tests.

Conclusion

The current PWA foundation is Serwist-based and no longer depends on the old
manual service-worker generation/registration flow. The important remaining
PWA work is runtime verification on real browsers/devices and completion of
the production push backend contract.
