import { execFile } from "child_process";
import { promisify } from "util";

// Shared process-execution helpers, used by the platform providers and by
// cross-platform tools like nmap. OS-specific commands belong in ./platform.
export const execFileAsync = promisify(execFile);

export function runPowerShell<T>(script: string): Promise<T | null> {
  return execFileAsync("powershell", ["-NoProfile", "-NonInteractive", "-Command", script])
    .then(({ stdout }) => {
      const trimmed = stdout.trim();
      return trimmed ? (JSON.parse(trimmed) as T) : null;
    })
    .catch((err: unknown) => {
      // A silent null here is indistinguishable from "no result" and hides
      // real failures (execution policy, missing cmdlet, bad JSON) — log so
      // they're diagnosable instead of just looking like "not connected".
      console.error("runPowerShell failed:", err);
      return null;
    });
}

/** Runs a command that prints JSON on stdout (Linux's `ip -j ...`) and parses it — the Linux-side counterpart to `runPowerShell`. */
export function runJson<T>(command: string, args: string[]): Promise<T | null> {
  return execFileAsync(command, args)
    .then(({ stdout }) => {
      const trimmed = stdout.trim();
      return trimmed ? (JSON.parse(trimmed) as T) : null;
    })
    .catch((err: unknown) => {
      console.error(`runJson failed (${command} ${args.join(" ")}):`, err);
      return null;
    });
}

export function normalizeMac(mac: string | null): string | null {
  if (!mac) return null;
  return mac.replace(/-/g, ":").toLowerCase();
}
