import type { DeviceStatus, Severity, UserStatus } from "@/app/_lib/dashboard-data";

/** Brand tint keys — each maps to a `--tint-*-bg` / `--tint-*-fg` pair defined in globals.css. */
export type TintColor = "navy" | "amber" | "teal" | "aqua" | "muted";

export const TINT: Record<TintColor, { bg: string; fg: string }> = {
  navy: { bg: "bg-tint-navy-bg", fg: "text-tint-navy-fg" },
  amber: { bg: "bg-tint-amber-bg", fg: "text-tint-amber-fg" },
  teal: { bg: "bg-tint-teal-bg", fg: "text-tint-teal-fg" },
  aqua: { bg: "bg-tint-aqua-bg", fg: "text-tint-aqua-fg" },
  muted: { bg: "bg-muted", fg: "text-muted-foreground" },
};

export const tintClass = (color: TintColor) => `${TINT[color].bg} ${TINT[color].fg}`;

export const hoverTintClass = (color: TintColor | "destructive") =>
  color === "destructive"
    ? "hover:bg-destructive/10 hover:text-destructive"
    : `hover:${TINT[color].bg} hover:${TINT[color].fg}`;

/** Readable text color for a *solid* tint background (e.g. an avatar swatch), as opposed to the pastel `TINT` backgrounds used by Tag/IconSwatch. */
export const tintContrastText = (color: TintColor) =>
  color === "navy" || color === "teal" ? "text-white" : "text-(--brand-navy)";

/** Traffic-light status keys — map to `--status-*` tokens in globals.css. */
export type StatusColor = "online" | "warning" | "critical";

export const STATUS: Record<StatusColor, { dot: string; text: string; borderLeft: string }> = {
  online: { dot: "bg-status-online", text: "text-status-online", borderLeft: "border-l-status-online" },
  warning: { dot: "bg-status-warning", text: "text-status-warning", borderLeft: "border-l-status-warning" },
  critical: { dot: "bg-status-critical", text: "text-status-critical", borderLeft: "border-l-status-critical" },
};

export const DEVICE_STATUS_TINT: Record<DeviceStatus, TintColor> = {
  online: "teal",
  idle: "amber",
  blocked: "navy",
  paused: "muted",
};

export const DEVICE_STATUS_DOT: Record<DeviceStatus, string> = {
  online: STATUS.online.dot,
  idle: STATUS.warning.dot,
  blocked: STATUS.critical.dot,
  paused: "bg-muted-foreground",
};

export const USER_ROLE_TINT: Record<string, TintColor> = {
  Admins: "navy", Staff: "aqua", Students: "teal", Guests: "muted", IoT: "amber",
};

export const USER_STATUS_TINT: Record<UserStatus, TintColor> = {
  active: "teal",
  suspended: "navy",
};

export const USER_STATUS_DOT: Record<UserStatus, string> = {
  active: STATUS.online.dot,
  suspended: STATUS.critical.dot,
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
};

export const SEVERITY_TINT: Record<Severity, TintColor> = {
  critical: "navy",
  warning: "amber",
  info: "aqua",
};

export const SEVERITY_STATUS: Record<Severity, StatusColor> = {
  critical: "critical",
  warning: "warning",
  info: "online",
};
