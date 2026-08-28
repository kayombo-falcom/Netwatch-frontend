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

export type PingResult = { alive: boolean; ttl: number | null };

/** Pings a host once. `alive` reflects whether it replied at all; `ttl` is the reply's TTL, if any (a supporting signal for OS guessing, not proof by itself). */
export async function pingOnce(ip: string, timeoutMs: number): Promise<PingResult> {
  const { stdout } = await execFileAsync("ping", ["-n", "1", "-w", String(timeoutMs), ip]).catch(() => ({ stdout: "" }));
  const match = stdout.match(/TTL=(\d+)/i);
  return { alive: match !== null, ttl: match ? Number(match[1]) : null };
}

export type PacketLossResult = { sent: number; received: number; lossPercent: number };

/**
 * Sends `count` pings to `target` in one `ping` call and reads Windows'
 * own summary line, rather than looping `pingOnce` — one process instead
 * of `count` of them. At 100% loss Windows' `ping` exits non-zero, so the
 * summary is read off the error too, not just a clean run.
 */
export async function measurePacketLoss(target: string, count: number, timeoutMs: number): Promise<PacketLossResult | null> {
  const stdout = await execFileAsync("ping", ["-n", String(count), "-w", String(timeoutMs), target])
    .then(r => r.stdout)
    .catch((err: NodeJS.ErrnoException & { stdout?: string }) => err.stdout ?? "");

  const match = stdout.match(/Sent = (\d+), Received = (\d+), Lost = (\d+) \((\d+)% loss\)/i);
  return match ? { sent: Number(match[1]), received: Number(match[2]), lossPercent: Number(match[4]) } : null;
}
