# Netwatch — Network Monitoring Dashboard

> See every device, user and access point on your network in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/status-in_development-orange)

Netwatch is an admin dashboard for office and campus Wi-Fi networks. It shows live bandwidth, connected devices, access point health and alerts, so admins can spot problems fast.

## ✨ Features

- **Overview:** key metrics, today's bandwidth chart, active devices, AP health, recent alerts
- **Devices:** every connected device with IP, user, access point and data used
- **Access Points:** load and client count per AP
- **Traffic:** upload / download usage over time
- **Alerts:** critical, warning and info events
- **Users & Policies:** manage who connects and what they can do
- **Quick actions:** add device, speed test, export report, sync firmware, restart APs

## 🛠 Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Charts & icons | Recharts, lucide-react |

Backend: [Netwach-backend](https://github.com/kayombo-falcom/Netwach-backend) (Django, in progress).

## 🚀 Getting Started

```bash
git clone https://github.com/kayombo-falcom/Netwatch-frontend.git
cd Netwatch-frontend
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## 📁 Structure

```
src/app/
├─ (dashboard)/   # overview, devices, access-points, traffic,
│                 # alerts, users, policies, settings
├─ _components/   # shared dashboard UI (cards, badges, buttons)
└─ _lib/          # sample dashboard data
```

> The dashboard currently uses sample data. Live data will come from the Django API.

## 👤 Author

**Hirorims Kayombo** · [Portfolio](https://hirorims.netlify.app/) · [GitHub](https://github.com/kayombo-falcom)
