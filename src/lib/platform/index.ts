import os from "os";
import { linuxProvider } from "./linux";
import type { NetworkProvider } from "./types";
import { windowsProvider } from "./windows";

export * from "./types";

// OS Detector: picks the right provider once and caches it, so nothing else
// has to check os.platform() directly.
let cachedProvider: NetworkProvider | null = null;

function detectProvider(): NetworkProvider {
  switch (os.platform()) {
    case "win32":
      return windowsProvider;
    case "linux":
      return linuxProvider;
    default:
      // macOS isn't a supported target yet — Linux is the closer fallback.
      return linuxProvider;
  }
}

export function getNetworkProvider(): NetworkProvider {
  if (!cachedProvider) cachedProvider = detectProvider();
  return cachedProvider;
}
