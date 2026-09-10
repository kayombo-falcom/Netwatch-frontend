This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites (first-time setup)

This frontend is a thin proxy — all live network state (device discovery, OS detection, Wi-Fi/adapter info, packet loss) comes from the Django backend in `Netwach-backend/`, which runs in Docker with `network_mode: host` so it can see the real LAN instead of Docker's isolated bridge network. Start the backend first (`docker compose up` from `Netwach-backend/`), then `npm install && npm run dev` here.

The backend container is Linux either way, so the same Docker setup works on a Linux or Windows host — but on Windows, `network_mode: host` needs two one-time settings so the container actually reaches the physical LAN instead of sitting behind Docker Desktop's own NAT:

- **Docker Desktop → Settings → Resources → Network → enable Host Networking.**
- **WSL2 mirrored networking**: add `networkingMode=mirrored` under `[wsl2]` in `%UserProfile%\.wslconfig`, then restart WSL (`wsl --shutdown`) and Docker Desktop.

Known caveat: Wi-Fi-specific fields (signal %, channel, band) may not fully populate on Windows even with the above, since mirrored networking mainly shares IP-level connectivity rather than low-level wireless radio info — device discovery, OS detection, and DNS capture are expected to work regardless. macOS isn't supported.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
