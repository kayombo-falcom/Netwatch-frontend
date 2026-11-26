# Netwatch — Network Monitoring Dashboard

> See every device on your LAN: who's connected, what OS they run, how fast the link is and what they're doing.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)
![Status](https://img.shields.io/badge/status-in_development-orange)

> Active work is on the [`development`](https://github.com/kayombo-falcom/Netwatch-frontend/tree/development) branch.

Netwatch is a dashboard for home and office networks. The frontend is a thin layer: all live network data comes from the [Netwatch backend](https://github.com/kayombo-falcom/Netwach-backend) (Django), which scans the real LAN.

## Features

- **Overview:** key metrics, bandwidth chart, active devices, AP health, recent alerts
- **Devices:** live discovery with IP, hostname, OS detection and activity per device
- **Network & Wi-Fi:** adapter info, signal, channel, band and packet loss
- **Speed test:** built-in test powered by Cloudflare Speedtest
- **Traffic & DNS:** which domains devices are looking up
- **Alerts, Users & Policies:** events, accounts and rules
- **Secure sign-in:** JWT login and logout through Next.js API routes

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router, API routes), React 19, TypeScript 5 |
| UI | Tailwind CSS 4, shadcn/ui, Base UI, tw-animate-css, Geist font |
| Styling helpers | class-variance-authority, clsx, tailwind-merge |
| Charts & icons | Recharts, lucide-react |
| Speed test | @cloudflare/speedtest |
| Auth | JWT from the Django API (login, refresh, logout) |
| Quality | ESLint 9 |

**Backend platform:** Django 6 · Django REST Framework · SimpleJWT · PostgreSQL 16 · Docker (host networking) · nmap

## Getting Started

**1. Start the backend first** (`docker compose up` in [Netwach-backend](https://github.com/kayombo-falcom/Netwach-backend)). It runs in Docker with `network_mode: host` so it can see the real LAN.

**2. Run the frontend**

```bash
git clone https://github.com/kayombo-falcom/Netwatch-frontend.git
cd Netwatch-frontend
git checkout development
npm install
npm run dev      # http://localhost:3000
```

### Windows hosts (one-time)

The backend container is Linux, so it works on Linux and Windows. On Windows, host networking needs two settings:

1. **Docker Desktop** → Settings → Resources → Network → enable **Host Networking**
2. **WSL2 mirrored networking:** add `networkingMode=mirrored` under `[wsl2]` in `%UserProfile%\.wslconfig`, then run `wsl --shutdown` and restart Docker Desktop

> Wi-Fi details (signal %, channel, band) may not fully show on Windows. Device discovery, OS detection and DNS capture still work. macOS isn't supported.

## Structure

```
src/app/
├─ (auth)/        # login
├─ (dashboard)/   # overview, devices, access-points, traffic,
│                 # alerts, users, policies, settings
├─ api/           # route handlers that proxy to the Django API
├─ _lib/          # hooks, types, API helpers, speed test
└─ fonts/
```

## Author

**Hirorims Kayombo** · [Portfolio](https://hirorims.netlify.app/) · [GitHub](https://github.com/kayombo-falcom)
