import { measurePacketLoss, type PacketLossResult } from "./shell";

// Cloudflare's public resolver — same provider as the rest of the speed
// test, and reliable enough that any loss reported is our own path's fault,
// not the target's.
const TARGET = "1.1.1.1";

// Windows paces `ping` sends about 1s apart regardless of -w, so 10 pings is
// already a ~10s measurement — enough for 10%-granularity without stretching
// what's meant to be a quick speed test into a much longer wait.
const PING_COUNT = 10;
const PING_TIMEOUT_MS = 1000;

export async function measureConnectionPacketLoss(): Promise<PacketLossResult | null> {
  return measurePacketLoss(TARGET, PING_COUNT, PING_TIMEOUT_MS);
}
