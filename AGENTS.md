<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Where logic belongs

Any logic that reads or writes data which needs to be **stored/persisted** belongs in the Django backend (`Netwach-backend/`), not in the Next.js frontend. Next.js API routes under `src/app/api/` that deal with persisted data (users, roles, auth, etc.) must stay thin proxies to the backend — see `src/lib/backend-proxy.ts` — not implement storage logic themselves.

The one exception is logic that only touches live, non-persisted local state — e.g. the LAN device scan in `src/app/api/network/devices/route.ts` (`src/lib/devices.ts`), which reads the host's ARP table/ping sweep on demand and stores nothing. That stays in the frontend because it depends on the frontend server's network position, not because it's frontend-appropriate logic.

When adding a new feature that needs persistence, add its models/repositories/services/views to the appropriate Django app (or a new one, following the existing `users`/`authorization`/`authentication` pattern) and expose it through `/api/v1/`, then proxy to it from Next.js.

## Code comments

Keep comments short, clear, and in simple language. One line is enough for most cases — explain the *why*, not the *what*, and avoid jargon or long sentences.
