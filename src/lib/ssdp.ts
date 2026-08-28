import dgram from "dgram";

// SSDP (UPnP discovery) — a multicast query that live devices answer by
// naming their OS in the SERVER header. Some Android phones and most
// smart-TV/media devices answer this even when mDNS doesn't.
const SSDP_MULTICAST_ADDR = "239.255.255.250";
const SSDP_PORT = 1900;
const SEARCH_WAIT_SECONDS = 1; // MX header — devices stagger their reply by up to this many seconds

export type SsdpResponse = { headers: Record<string, string> };

function parseSsdpHeaders(raw: string): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const line of raw.split("\r\n").slice(1)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    headers[line.slice(0, separator).trim().toUpperCase()] = line.slice(separator + 1).trim();
  }
  return headers;
}

/** Sends an SSDP M-SEARCH and returns the first reply from `ip` — devices reply directly to us, unlike mDNS's shared multicast replies. */
export function querySsdp(ip: string, timeoutMs: number): Promise<SsdpResponse | null> {
  return new Promise(resolve => {
    const socket = dgram.createSocket("udp4");
    let settled = false;

    const finish = (result: SsdpResponse | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.close();
      resolve(result);
    };

    socket.on("error", () => finish(null));
    socket.on("message", (msg, rinfo) => {
      if (rinfo.address !== ip) return; // multicast reaches every listening device; only our target's reply matters
      finish({ headers: parseSsdpHeaders(msg.toString("utf8")) });
    });

    const query = [
      "M-SEARCH * HTTP/1.1",
      `HOST: ${SSDP_MULTICAST_ADDR}:${SSDP_PORT}`,
      'MAN: "ssdp:discover"',
      `MX: ${SEARCH_WAIT_SECONDS}`,
      "ST: ssdp:all",
      "", "",
    ].join("\r\n");

    socket.bind(() => {
      socket.setMulticastTTL(4);
      socket.send(query, SSDP_PORT, SSDP_MULTICAST_ADDR, err => { if (err) finish(null); });
    });

    const timer = setTimeout(() => finish(null), timeoutMs);
  });
}
