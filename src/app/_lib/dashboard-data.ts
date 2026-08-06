import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Monitor, Users, Radio, ShieldCheck, BarChart2, Bell, Settings } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type DeviceStatus = "online" | "idle" | "blocked" | "paused";
export type Severity = "critical" | "warning" | "info";

export const navItems: NavItem[] = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: Monitor },
  { href: "/users", label: "Users", icon: Users },
  { href: "/access-points", label: "Access Points", icon: Radio },
  { href: "/policies", label: "Policies", icon: ShieldCheck },
  { href: "/traffic", label: "Traffic Reports", icon: BarChart2 },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const screenTitles: Record<string, string> = {
  overview: "Network Overview",
  devices: "Devices",
  users: "Users",
  "access-points": "Access Points",
  policies: "Policies",
  traffic: "Traffic Reports",
  alerts: "Alerts",
  settings: "Settings",
};

export const networks = ["Main Office", "Branch – Downtown", "Warehouse", "Guest Network"];

export const bwData = [
  { t: "08:00", down: 12, up: 4 },
  { t: "09:00", down: 34, up: 11 },
  { t: "10:00", down: 58, up: 19 },
  { t: "11:00", down: 71, up: 24 },
  { t: "12:00", down: 62, up: 21 },
  { t: "13:00", down: 45, up: 15 },
  { t: "14:00", down: 68, up: 23 },
  { t: "15:00", down: 82, up: 28 },
  { t: "16:00", down: 74, up: 25 },
  { t: "17:00", down: 55, up: 18 },
  { t: "18:00", down: 31, up: 10 },
  { t: "19:00", down: 18, up: 6 },
];

export const devicesData = [
  { id: 1, name: "MacBook Pro – Sarah", user: "Sarah Chen", type: "Laptop", ip: "10.0.1.42", mac: "A4:C3:F0:1B:2D:8E", ap: "Reception", session: "4h 12m", data: "2.1 GB", status: "online" as DeviceStatus },
  { id: 2, name: "iPhone 15 – Marcus", user: "Marcus Webb", type: "Phone", ip: "10.0.1.87", mac: "3C:22:FB:4A:9D:01", ap: "Meeting Rm", session: "1h 45m", data: "340 MB", status: "online" as DeviceStatus },
  { id: 3, name: "AXIS-Cam-3F", user: "IoT", type: "Camera", ip: "10.0.2.11", mac: "00:40:8C:88:1E:4F", ap: "Warehouse", session: "18d 4h", data: "48.3 GB", status: "online" as DeviceStatus },
  { id: 4, name: "iPad – Reception", user: "Front Desk", type: "Tablet", ip: "10.0.1.23", mac: "DC:A9:04:B2:3C:77", ap: "Reception", session: "6h 58m", data: "890 MB", status: "idle" as DeviceStatus },
  { id: 5, name: "Dell XPS – Tom K.", user: "Tom Kowalski", type: "Laptop", ip: "10.0.1.55", mac: "E8:6A:64:9F:12:BA", ap: "Lobby", session: "2h 03m", data: "1.4 GB", status: "online" as DeviceStatus },
  { id: 6, name: "Unknown Android", user: "Guest", type: "Phone", ip: "10.0.3.99", mac: "B8:27:EB:CC:50:3D", ap: "Lobby", session: "0h 22m", data: "55 MB", status: "blocked" as DeviceStatus },
  { id: 7, name: "Surface Pro – Lena", user: "Lena Morales", type: "Laptop", ip: "10.0.1.61", mac: "60:45:CB:1A:FF:2E", ap: "Meeting Rm", session: "3h 17m", data: "780 MB", status: "paused" as DeviceStatus },
  { id: 8, name: "Sonos-Living", user: "IoT", type: "Speaker", ip: "10.0.2.44", mac: "94:9F:3E:12:CD:88", ap: "Lobby", session: "21d 2h", data: "12.7 GB", status: "online" as DeviceStatus },
];

export const usersData = [
  { id: 1, name: "Sarah Chen", initials: "SC", group: "Admins", devices: 3, data: "8.4 GB", policy: "Full Access", lastSeen: "now", color: "#6366f1" },
  { id: 2, name: "Marcus Webb", initials: "MW", group: "Staff", devices: 2, data: "2.1 GB", policy: "Staff Default", lastSeen: "12m ago", color: "#2563eb" },
  { id: 3, name: "Tom Kowalski", initials: "TK", group: "Staff", devices: 1, data: "1.4 GB", policy: "Staff Default", lastSeen: "2h ago", color: "#0891b2" },
  { id: 4, name: "Lena Morales", initials: "LM", group: "Staff", devices: 2, data: "990 MB", policy: "Staff Default", lastSeen: "5m ago", color: "#7c3aed" },
  { id: 5, name: "James Park", initials: "JP", group: "Students", devices: 1, data: "450 MB", policy: "Student Tier", lastSeen: "1h ago", color: "#059669" },
  { id: 6, name: "Priya Nair", initials: "PN", group: "Students", devices: 2, data: "310 MB", policy: "Student Tier", lastSeen: "30m ago", color: "#d97706" },
  { id: 7, name: "Guest #4821", initials: "G", group: "Guests", devices: 1, data: "55 MB", policy: "Guest Wi-Fi", lastSeen: "22m ago", color: "#64748b" },
  { id: 8, name: "Thermostat Hub", initials: "T", group: "IoT", devices: 4, data: "61 GB", policy: "IoT Isolated", lastSeen: "now", color: "#dc2626" },
];

export const apsData = [
  { id: 1, name: "AP-Reception-01", location: "Reception", status: "online" as DeviceStatus, clients: 14, signal: -52, channel: 6, load: 42, firmware: "6.4.1", ip: "10.0.0.10", model: "UniFi U6 Pro" },
  { id: 2, name: "AP-MeetingRm-02", location: "Meeting Room", status: "online" as DeviceStatus, clients: 11, signal: -48, channel: 36, load: 61, firmware: "6.4.1", ip: "10.0.0.11", model: "UniFi U6 Lite" },
  { id: 3, name: "AP-Warehouse-03", location: "Warehouse", status: "idle" as DeviceStatus, clients: 3, signal: -67, channel: 11, load: 18, firmware: "6.3.9", ip: "10.0.0.12", model: "UniFi U6 Mesh" },
  { id: 4, name: "AP-Lobby-04", location: "Lobby", status: "online" as DeviceStatus, clients: 14, signal: -55, channel: 1, load: 73, firmware: "6.4.1", ip: "10.0.0.13", model: "UniFi U6 Pro" },
];

export const alertsData = [
  { id: 1, severity: "critical" as Severity, title: "AP-Lobby-04 approaching capacity", message: "AP-Lobby-04 is serving 14 clients at 73% load. Consider load balancing or adding a second AP to this zone.", time: "2 min ago", read: false, action: "View AP" },
  { id: 2, severity: "critical" as Severity, title: "Unauthorized device detected", message: "Unknown Android device (MAC: B8:27:EB:CC:50:3D) connected on Guest SSID without prior registration. Device has been auto-blocked per policy.", time: "18 min ago", read: false, action: "Review Device" },
  { id: 3, severity: "warning" as Severity, title: "AP-Warehouse-03 firmware outdated", message: "AP-Warehouse-03 is running firmware v6.3.9. Latest stable is v6.4.1. Schedule an update during off-hours.", time: "1h ago", read: false, action: "Update Firmware" },
  { id: 4, severity: "warning" as Severity, title: "Bandwidth spike — 10.0.1.55", message: "Device 10.0.1.55 (Dell XPS – Tom K.) consumed 1.4 GB in the last 2 hours, exceeding the staff alert threshold of 1 GB.", time: "2h ago", read: true, action: "View Usage" },
  { id: 5, severity: "info" as Severity, title: "Guest network session expired", message: "4 guest sessions expired and were automatically terminated as per the Guest Wi-Fi 8-hour session policy.", time: "3h ago", read: true, action: null },
  { id: 6, severity: "info" as Severity, title: "Scheduled backup completed", message: "Network configuration snapshot saved successfully. Backup size: 2.3 MB. Stored to cloud vault.", time: "6h ago", read: true, action: null },
  { id: 7, severity: "warning" as Severity, title: "High packet loss on AP-Reception-01", message: "AP-Reception-01 logged 3.4% packet loss over the last 15 minutes, potentially indicating interference on channel 6.", time: "8h ago", read: true, action: "Diagnose" },
  { id: 8, severity: "critical" as Severity, title: "DNS resolution failures", message: "32 DNS queries failed in the last hour. Upstream DNS servers 8.8.8.8 and 1.1.1.1 appear unreachable from the gateway.", time: "Yesterday", read: true, action: "View Logs" },
];

export const trafficBwData = [
  { d: "Mon", down: 145, up: 48 },
  { d: "Tue", down: 178, up: 61 },
  { d: "Wed", down: 134, up: 44 },
  { d: "Thu", down: 192, up: 67 },
  { d: "Fri", down: 224, up: 78 },
  { d: "Sat", down: 88, up: 29 },
  { d: "Sun", down: 63, up: 21 },
];

export const trafficCategoryData = [
  { name: "Video Streaming", value: 38, color: "#2563eb" },
  { name: "Web Browsing", value: 22, color: "#22c55e" },
  { name: "Cloud Storage", value: 17, color: "#f59e0b" },
  { name: "Video Calls", value: 14, color: "#8b5cf6" },
  { name: "Other", value: 9, color: "#64748b" },
];

export const topUsersTraffic = [
  { name: "Sarah Chen", usage: 8.4, limit: 20 },
  { name: "AXIS-Cam-3F", usage: 48.3, limit: 100 },
  { name: "Sonos-Living", usage: 12.7, limit: 50 },
  { name: "Tom Kowalski", usage: 5.1, limit: 20 },
  { name: "Marcus Webb", usage: 2.1, limit: 20 },
];

export const peakData = [
  { h: "6am", v: 12 }, { h: "7am", v: 28 }, { h: "8am", v: 56 },
  { h: "9am", v: 82 }, { h: "10am", v: 91 }, { h: "11am", v: 88 },
  { h: "12pm", v: 74 }, { h: "1pm", v: 68 }, { h: "2pm", v: 85 },
  { h: "3pm", v: 93 }, { h: "4pm", v: 79 }, { h: "5pm", v: 61 },
  { h: "6pm", v: 42 }, { h: "7pm", v: 31 }, { h: "8pm", v: 18 },
];
