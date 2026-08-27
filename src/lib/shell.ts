import { execFile } from "child_process";
import { promisify } from "util";

// Shared low-level primitives for talking to the host OS (Windows
// netsh/PowerShell/arp/ping) — kept in one place so every feature that reads
// live network state (Wi-Fi status, LAN device discovery, ...) shells out the
// same way instead of re-implementing it.
export const execFileAsync = promisify(execFile);

export function runPowerShell<T>(script: string): Promise<T | null> {
  return execFileAsync("powershell", ["-NoProfile", "-NonInteractive", "-Command", script])
    .then(({ stdout }) => {
      const trimmed = stdout.trim();
      return trimmed ? (JSON.parse(trimmed) as T) : null;
    })
    .catch(() => null);
}

export function normalizeMac(mac: string | null): string | null {
  if (!mac) return null;
  return mac.replace(/-/g, ":").toLowerCase();
}
