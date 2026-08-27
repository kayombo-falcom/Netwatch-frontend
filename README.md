This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites (first-time setup)

This app reads live network state from the host it runs on, so beyond `npm install` it needs a couple of things already on the machine:

- **Windows.** Device/Wi-Fi status reads shell out to `netsh`, `powershell`, `arp`, and `ping` directly — there's no cross-platform fallback.
- **[Nmap](https://nmap.org/download.html)** (Windows installer, or `winget install --id Insecure.Nmap -e`) — powers the "Detect OS" feature (`/api/network/os-detect`). Make sure its installer option for **Npcap** is checked; without Npcap, OS detection can't send the raw packets it needs even though the `nmap` command itself will run. Everything else in the app (device discovery, Wi-Fi status, speed test) works fine without it — only OS detection needs it, and it fails with a clear message if it's missing.
- **Administrator privileges**, only when you want OS detection to actually work: Windows requires an elevated process for Nmap's raw-packet probes. Use `npm run dev:admin` instead of `npm run dev` to launch an elevated dev server automatically (it self-relaunches via a UAC prompt if the current terminal isn't already elevated).

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
