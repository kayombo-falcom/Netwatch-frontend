<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Where logic belongs

All logic — including live network probing (ARP/ping sweep, OS fingerprinting, mDNS/SSDP/NetBIOS discovery, adapter/Wi-Fi info, packet loss) and anything that reads or writes persisted data — belongs in the Django backend (`Netwach-backend/`), not in the Next.js frontend. Every Next.js API route under `src/app/api/` must be a thin proxy to the backend — see `src/lib/backend-proxy.ts` — never implementing storage logic or shelling out to system commands itself.

This deliberately gives up the frontend's own network position: the backend runs colocated with the frontend on the same LAN-connected host (`docker-compose.yml`'s `web` service uses `network_mode: host` specifically so it can too), so it can do everything the frontend process used to. It also means the containerized backend only targets Linux hosts — the previous Windows provider (`netsh`/PowerShell) has no equivalent inside a Linux container and isn't supported.

When adding a new feature, add its models/repositories/services/views to the appropriate Django app (`network` for live probing, or a new one following the existing `users`/`authorization`/`authentication`/`devices` pattern for persisted data) and expose it through `/api/v1/`, then proxy to it from Next.js.

## Code comments

Keep comments short, clear, and in simple language. One line is enough for most cases — explain the *why*, not the *what*, and avoid jargon or long sentences.
