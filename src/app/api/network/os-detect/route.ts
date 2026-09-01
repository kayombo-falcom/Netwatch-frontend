import { NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";
import { detectOs, type OsDetectionResult } from "@/lib/os-fingerprint";

// Runs a live nmap scan against the requested host, so it must never be
// statically cached/optimized — every hit has to re-check.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Best-effort: stores the result for later (device list, history) via the
// same backend proxy every other persisted write in this app uses. Never
// throws into the caller — a storage hiccup shouldn't fail a live detection
// the user is looking at right now, and the DEVICES_MANAGE permission this
// write requires isn't a precondition for running detection itself.
async function persistDetection(mac: string, ip: string, result: OsDetectionResult) {
  if (result.status !== "detected") return;
  try {
    const res = await proxyToBackend("/devices/detection/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mac,
        ip,
        os_family: result.osFamily,
        os_name: result.osName,
        os_version: result.osVersion,
        device_type: result.deviceType,
        confidence: result.confidence,
        signals: result.signals,
      }),
    });
    if (!res.ok) console.error("Failed to persist OS detection:", res.status, await res.text());
  } catch (err) {
    console.error("Failed to persist OS detection:", err);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ip = url.searchParams.get("ip");
  const mac = url.searchParams.get("mac") ?? undefined;
  if (!ip) {
    return NextResponse.json(
      { error: 'Missing required "ip" query parameter' },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const result = await detectOs(ip, mac);
    if (mac) await persistDetection(mac, ip, result);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "Unable to run OS detection" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
