import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Monitor, Users, Radio, ShieldCheck, BarChart2, Bell, Settings, Activity } from "lucide-react";
import type { TintColor } from "@/lib/colors";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type DeviceStatus = "online" | "idle" | "blocked" | "paused";
export type Severity = "critical" | "warning" | "info";
export type UserStatus = "active" | "suspended";

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
  profile: "My Profile",
};

export const networks = ["Main Office", "Branch – Downtown", "Warehouse", "Guest Network"];

export type PolicyCategory = "User Management" | "Device Management" | "Monitoring" | "Alerts" | "Reports";

export const policyCategories: { name: PolicyCategory; icon: LucideIcon; color: TintColor }[] = [
  { name: "User Management", icon: Users, color: "navy" },
  { name: "Device Management", icon: Monitor, color: "aqua" },
  { name: "Monitoring", icon: Activity, color: "teal" },
  { name: "Alerts", icon: Bell, color: "amber" },
  { name: "Reports", icon: BarChart2, color: "muted" },
];

export const policiesData: { name: string; category: PolicyCategory; group: string }[] = [
  { name: "Admin Full Access", category: "User Management", group: "Admins" },
  { name: "Guest Wi-Fi", category: "User Management", group: "Guests" },
  { name: "IoT Isolated", category: "Device Management", group: "IoT" },
  { name: "Bandwidth Threshold", category: "Monitoring", group: "Staff" },
  { name: "Alert Escalation", category: "Alerts", group: "Admins" },
  { name: "Report Retention", category: "Reports", group: "Staff" },
];

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

export type ConnectionType = "Wi-Fi" | "Ethernet";

export const devicesData = [
  { id: 1, name: "MacBook Pro – Sarah", user: "Sarah Chen", type: "Laptop", os: "macOS", ip: "10.0.1.42", mac: "A4:C3:F0:1B:2D:8E", ap: "Reception", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "4h 12m", lastSeen: "now", data: "2.1 GB", status: "online" as DeviceStatus },
  { id: 2, name: "iPhone 15 – Marcus", user: "Marcus Webb", type: "Phone", os: "iOS", ip: "10.0.1.87", mac: "3C:22:FB:4A:9D:01", ap: "Meeting Rm", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "1h 45m", lastSeen: "now", data: "340 MB", status: "online" as DeviceStatus },
  { id: 3, name: "AXIS-Cam-3F", user: "IoT", type: "Camera", os: "Linux", ip: "10.0.2.11", mac: "00:40:8C:88:1E:4F", ap: "Warehouse", connectionType: "Ethernet" as ConnectionType, connectedSince: "18d 4h", lastSeen: "now", data: "48.3 GB", status: "online" as DeviceStatus },
  { id: 4, name: "iPad – Reception", user: "Front Desk", type: "Tablet", os: "iPadOS", ip: "10.0.1.23", mac: "DC:A9:04:B2:3C:77", ap: "Reception", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "6h 58m", lastSeen: "8m ago", data: "890 MB", status: "idle" as DeviceStatus },
  { id: 5, name: "Dell XPS – Tom K.", user: "Tom Kowalski", type: "Laptop", os: "Windows", ip: "10.0.1.55", mac: "E8:6A:64:9F:12:BA", ap: "Lobby", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "2h 03m", lastSeen: "now", data: "1.4 GB", status: "online" as DeviceStatus },
  { id: 6, name: "Unknown Android", user: "Guest", type: "Phone", os: "Android", ip: "10.0.3.99", mac: "B8:27:EB:CC:50:3D", ap: "Lobby", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "0h 22m", lastSeen: "3h ago", data: "55 MB", status: "blocked" as DeviceStatus },
  { id: 7, name: "Surface Pro – Lena", user: "Lena Morales", type: "Laptop", os: "Windows", ip: "10.0.1.61", mac: "60:45:CB:1A:FF:2E", ap: "Meeting Rm", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "3h 17m", lastSeen: "45m ago", data: "780 MB", status: "paused" as DeviceStatus },
  { id: 8, name: "Sonos-Living", user: "IoT", type: "Speaker", os: "Linux", ip: "10.0.2.44", mac: "94:9F:3E:12:CD:88", ap: "Lobby", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "21d 2h", lastSeen: "now", data: "12.7 GB", status: "online" as DeviceStatus },
  { id: 9, name: "ThinkPad – Elena", user: "Elena Vasquez", type: "Laptop", os: "Windows", ip: "10.0.1.63", mac: "5C:F9:38:0A:6B:12", ap: "Reception", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "5h 21m", lastSeen: "now", data: "1.8 GB", status: "online" as DeviceStatus },
  { id: 10, name: "Galaxy S24 – David", user: "David Kim", type: "Phone", os: "Android", ip: "10.0.1.71", mac: "8C:79:F5:2D:44:9A", ap: "Meeting Rm", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "0h 48m", lastSeen: "15m ago", data: "210 MB", status: "idle" as DeviceStatus },
  { id: 11, name: "Smart TV – Lobby", user: "IoT", type: "TV", os: "Android TV", ip: "10.0.2.20", mac: "F0:B4:29:6E:11:C3", ap: "Lobby", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "9d 14h", lastSeen: "now", data: "31.2 GB", status: "online" as DeviceStatus },
  { id: 12, name: "HP LaserJet – 2F", user: "IoT", type: "Printer", os: "Embedded", ip: "10.0.2.31", mac: "30:9C:23:88:5F:D4", ap: "Warehouse", connectionType: "Ethernet" as ConnectionType, connectedSince: "2d 6h", lastSeen: "2h ago", data: "410 MB", status: "paused" as DeviceStatus },
  { id: 13, name: "MacBook Air – Olivia", user: "Olivia Bennett", type: "Laptop", os: "macOS", ip: "10.0.1.66", mac: "AC:BC:32:7A:1D:E6", ap: "Reception", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "3h 09m", lastSeen: "now", data: "960 MB", status: "online" as DeviceStatus },
  { id: 14, name: "iPad – Noah", user: "Noah Whitfield", type: "Tablet", os: "iPadOS", ip: "10.0.1.74", mac: "D0:C5:F3:19:8B:2A", ap: "Meeting Rm", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "1h 32m", lastSeen: "22m ago", data: "540 MB", status: "idle" as DeviceStatus },
  { id: 15, name: "Pixel 8 – Ava", user: "Ava Thompson", type: "Phone", os: "Android", ip: "10.0.1.82", mac: "44:65:0D:9C:73:F1", ap: "Lobby", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "0h 12m", lastSeen: "1d ago", data: "48 MB", status: "blocked" as DeviceStatus },
  { id: 16, name: "Chromebook – Ethan", user: "Ethan Brooks", type: "Laptop", os: "ChromeOS", ip: "10.0.1.90", mac: "18:A6:F7:2B:5E:9C", ap: "Warehouse", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "2h 40m", lastSeen: "now", data: "620 MB", status: "online" as DeviceStatus },
  { id: 17, name: "Unknown iPhone", user: "Guest", type: "Phone", os: "iOS", ip: "10.0.3.14", mac: "9C:2A:70:E1:4C:88", ap: "Lobby", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "0h 06m", lastSeen: "6h ago", data: "22 MB", status: "blocked" as DeviceStatus },
  { id: 18, name: "Nest-Thermostat-2F", user: "IoT", type: "Thermostat", os: "Embedded", ip: "10.0.2.55", mac: "64:16:66:D3:8A:57", ap: "Warehouse", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "14d 8h", lastSeen: "now", data: "1.1 GB", status: "online" as DeviceStatus },
  { id: 19, name: "Surface Go – Isabella", user: "Isabella Rodriguez", type: "Tablet", os: "Windows", ip: "10.0.1.95", mac: "7C:D9:5C:41:2F:B0", ap: "Reception", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "4h 55m", lastSeen: "now", data: "1.3 GB", status: "online" as DeviceStatus },
  { id: 20, name: "Dell Latitude – Liam", user: "Liam Foster", type: "Laptop", os: "Windows", ip: "10.0.1.101", mac: "F4:5C:89:D6:33:7E", ap: "Meeting Rm", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "1d 3h", lastSeen: "5h ago", data: "2.4 GB", status: "paused" as DeviceStatus },
  { id: 21, name: "iPhone 14 – Mia", user: "Mia Chen", type: "Phone", os: "iOS", ip: "10.0.1.108", mac: "B0:35:9F:6C:82:1A", ap: "Reception", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "2h 17m", lastSeen: "now", data: "480 MB", status: "online" as DeviceStatus },
  { id: 22, name: "MacBook Pro – Zara", user: "Zara Ahmed", type: "Laptop", os: "macOS", ip: "10.0.1.115", mac: "E4:8D:8C:3A:97:60", ap: "Lobby", connectionType: "Wi-Fi" as ConnectionType, connectedSince: "6h 02m", lastSeen: "now", data: "1.9 GB", status: "online" as DeviceStatus },
];

export const usersData = [
  { id: 1, name: "Sarah Chen", email: "sarah.chen@netwatch.io", initials: "SC", role: "Admins", status: "active" as UserStatus, policy: "Full Access", lastSeen: "now", color: "var(--chart-1)" },
  { id: 2, name: "Marcus Webb", email: "marcus.webb@netwatch.io", initials: "MW", role: "Staff", status: "active" as UserStatus, policy: "Staff Default", lastSeen: "12m ago", color: "var(--chart-4)" },
  { id: 3, name: "Tom Kowalski", email: "tom.kowalski@netwatch.io", initials: "TK", role: "Staff", status: "active" as UserStatus, policy: "Staff Default", lastSeen: "2h ago", color: "var(--chart-4)" },
  { id: 4, name: "Lena Morales", email: "lena.morales@netwatch.io", initials: "LM", role: "Staff", status: "suspended" as UserStatus, policy: "Staff Default", lastSeen: "5m ago", color: "var(--chart-4)" },
  { id: 5, name: "James Park", email: "james.park@student.netwatch.io", initials: "JP", role: "Students", status: "active" as UserStatus, policy: "Student Tier", lastSeen: "1h ago", color: "var(--chart-3)" },
  { id: 6, name: "Priya Nair", email: "priya.nair@student.netwatch.io", initials: "PN", role: "Students", status: "active" as UserStatus, policy: "Student Tier", lastSeen: "30m ago", color: "var(--chart-3)" },
  { id: 7, name: "Guest #4821", email: "guest4821@netwatch.io", initials: "G", role: "Guests", status: "active" as UserStatus, policy: "Guest Wi-Fi", lastSeen: "22m ago", color: "var(--chart-2)" },
  { id: 8, name: "Thermostat Hub", email: "thermostat-hub@iot.netwatch.io", initials: "T", role: "IoT", status: "active" as UserStatus, policy: "IoT Isolated", lastSeen: "now", color: "var(--chart-2)" },
  { id: 9, name: "Elena Vasquez", email: "elena.vasquez@netwatch.io", initials: "EV", role: "Staff", status: "active" as UserStatus, policy: "Staff Default", lastSeen: "5h ago", color: "var(--chart-4)" },
  { id: 10, name: "David Kim", email: "david.kim@netwatch.io", initials: "DK", role: "Staff", status: "active" as UserStatus, policy: "Staff Default", lastSeen: "48m ago", color: "var(--chart-4)" },
  { id: 11, name: "Olivia Bennett", email: "olivia.bennett@netwatch.io", initials: "OB", role: "Admins", status: "active" as UserStatus, policy: "Full Access", lastSeen: "3h ago", color: "var(--chart-1)" },
  { id: 12, name: "Noah Whitfield", email: "noah.whitfield@student.netwatch.io", initials: "NW", role: "Students", status: "active" as UserStatus, policy: "Student Tier", lastSeen: "1h ago", color: "var(--chart-3)" },
  { id: 13, name: "Ava Thompson", email: "ava.thompson@student.netwatch.io", initials: "AT", role: "Students", status: "suspended" as UserStatus, policy: "Student Tier", lastSeen: "2d ago", color: "var(--chart-3)" },
  { id: 14, name: "Ethan Brooks", email: "ethan.brooks@student.netwatch.io", initials: "EB", role: "Students", status: "active" as UserStatus, policy: "Student Tier", lastSeen: "2h ago", color: "var(--chart-3)" },
  { id: 15, name: "Guest #5190", email: "guest5190@netwatch.io", initials: "G", role: "Guests", status: "active" as UserStatus, policy: "Guest Wi-Fi", lastSeen: "6m ago", color: "var(--chart-2)" },
  { id: 16, name: "Guest #5533", email: "guest5533@netwatch.io", initials: "G", role: "Guests", status: "suspended" as UserStatus, policy: "Guest Wi-Fi", lastSeen: "1d ago", color: "var(--chart-2)" },
  { id: 17, name: "Security Camera Hub", email: "security-camera-hub@iot.netwatch.io", initials: "S", role: "IoT", status: "active" as UserStatus, policy: "IoT Isolated", lastSeen: "now", color: "var(--chart-2)" },
  { id: 18, name: "Printer-2F", email: "printer-2f@iot.netwatch.io", initials: "P", role: "IoT", status: "active" as UserStatus, policy: "IoT Isolated", lastSeen: "2d ago", color: "var(--chart-2)" },
  { id: 19, name: "Isabella Rodriguez", email: "isabella.rodriguez@netwatch.io", initials: "IR", role: "Staff", status: "active" as UserStatus, policy: "Staff Default", lastSeen: "4h ago", color: "var(--chart-4)" },
  { id: 20, name: "Liam Foster", email: "liam.foster@netwatch.io", initials: "LF", role: "Staff", status: "suspended" as UserStatus, policy: "Staff Default", lastSeen: "1d ago", color: "var(--chart-4)" },
  { id: 21, name: "Mia Chen", email: "mia.chen@student.netwatch.io", initials: "MC", role: "Students", status: "active" as UserStatus, policy: "Student Tier", lastSeen: "2h ago", color: "var(--chart-3)" },
  { id: 22, name: "Zara Ahmed", email: "zara.ahmed@netwatch.io", initials: "ZA", role: "Admins", status: "active" as UserStatus, policy: "Full Access", lastSeen: "22m ago", color: "var(--chart-1)" },
];

export const apsData = [
  { id: 1, name: "AP-Reception-01", location: "Reception", status: "online" as DeviceStatus, clients: 14, signal: -52, channel: 6, load: 42, firmware: "6.4.1", ip: "10.0.0.10", model: "UniFi U6 Pro", mac: "AA:BB:CC:DD:EE:01", gateway: "10.0.0.1", subnet: "10.0.0.0/24", vlan: 10, managementIp: "10.0.0.10" },
  { id: 2, name: "AP-MeetingRm-02", location: "Meeting Room", status: "online" as DeviceStatus, clients: 11, signal: -48, channel: 36, load: 61, firmware: "6.4.1", ip: "10.0.0.11", model: "UniFi U6 Lite", mac: "AA:BB:CC:DD:EE:02", gateway: "10.0.0.1", subnet: "10.0.0.0/24", vlan: 20, managementIp: "10.0.0.11" },
  { id: 3, name: "AP-Warehouse-03", location: "Warehouse", status: "idle" as DeviceStatus, clients: 3, signal: -67, channel: 11, load: 18, firmware: "6.3.9", ip: "10.0.0.12", model: "UniFi U6 Mesh", mac: "AA:BB:CC:DD:EE:03", gateway: "10.0.0.1", subnet: "10.0.0.0/24", vlan: 30, managementIp: "10.0.0.12" },
  { id: 4, name: "AP-Lobby-04", location: "Lobby", status: "online" as DeviceStatus, clients: 14, signal: -55, channel: 1, load: 73, firmware: "6.4.1", ip: "10.0.0.13", model: "UniFi U6 Pro", mac: "AA:BB:CC:DD:EE:04", gateway: "10.0.0.1", subnet: "10.0.0.0/24", vlan: 40, managementIp: "10.0.0.13" },
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
  { name: "Video Streaming", value: 38, color: "var(--chart-1)" },
  { name: "Web Browsing", value: 22, color: "var(--chart-3)" },
  { name: "Cloud Storage", value: 17, color: "var(--chart-2)" },
  { name: "Video Calls", value: 14, color: "var(--chart-4)" },
  { name: "Other", value: 9, color: "var(--chart-5)" },
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
