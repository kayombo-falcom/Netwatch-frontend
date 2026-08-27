import dgram from "dgram";

// NetBIOS Name Service (NBNS), RFC 1002 §4.2 — a direct "Node Status" query
// to UDP port 137. This exists instead of shelling out to `nbtstat.exe`
// because that tool loops over *every local network adapter* before
// finishing (WSL/Hyper-V/VPN virtual adapters included), taking 15s+ on a
// machine with several of them regardless of any timeout we set. A raw
// unicast query to the target sidesteps that entirely.
const NBSTAT_PORT = 137;
const NBSTAT_QUERY_TYPE = 0x21;
const UNIQUE_NAME_SUFFIX = 0x00; // the <00> workstation entry is the device's own name
const GROUP_NAME_FLAG = 0x8000; // set = a shared group/workgroup name, not a specific device

/** Encodes a raw 16-byte NetBIOS name into NBNS wire format: 2 ASCII chars per nibble ('A' + nibble), per RFC 1002 §4.1. */
function encodeNetbiosHalfAscii(rawName: Buffer): Buffer {
  const encoded = Buffer.alloc(32);
  for (let i = 0; i < 16; i++) {
    encoded[i * 2] = 0x41 + ((rawName[i] >> 4) & 0x0f);
    encoded[i * 2 + 1] = 0x41 + (rawName[i] & 0x0f);
  }
  return encoded;
}

/** Builds a Node Status query for the wildcard name ("*" + 15 NUL bytes) — the standard way to ask "what names do you have?" rather than looking up one specific name. */
function buildNbstatQuery(): { packet: Buffer; transactionId: number } {
  const transactionId = Math.floor(Math.random() * 0x10000);

  const header = Buffer.alloc(12);
  header.writeUInt16BE(transactionId, 0);
  header.writeUInt16BE(1, 4); // QDCOUNT = 1

  const wildcardName = Buffer.concat([Buffer.from([0x2a]), Buffer.alloc(15)]);
  const question = Buffer.concat([
    Buffer.from([32]), encodeNetbiosHalfAscii(wildcardName), Buffer.from([0]),
    Buffer.from([0x00, NBSTAT_QUERY_TYPE]),
    Buffer.from([0x00, 0x01]), // QCLASS = IN
  ]);

  return { packet: Buffer.concat([header, question]), transactionId };
}

/** Reads past the answer's name field (either an inline encoded name or a compression pointer) to find where the name table starts. */
function skipResourceName(buf: Buffer, offset: number): number {
  if ((buf[offset] & 0xc0) === 0xc0) return offset + 2;
  while (offset < buf.length && buf[offset] !== 0) offset += buf[offset] + 1;
  return offset + 1;
}

/** Picks the device's own <00> UNIQUE name out of a Node Status response's name table. */
function parseNbstatResponse(buf: Buffer): string | null {
  if (buf.length < 12 || buf.readUInt16BE(6) < 1) return null; // ANCOUNT

  let offset = skipResourceName(buf, 12);
  offset += 2 + 2 + 4; // TYPE, CLASS, TTL
  const rdataStart = offset + 2; // + RDLENGTH
  const numNames = buf[rdataStart];

  for (let i = 0; i < numNames; i++) {
    const entry = rdataStart + 1 + i * 18;
    if (entry + 18 > buf.length) break;
    const suffix = buf[entry + 15];
    const flags = buf.readUInt16BE(entry + 16);
    if (suffix === UNIQUE_NAME_SUFFIX && (flags & GROUP_NAME_FLAG) === 0) {
      return buf.toString("ascii", entry, entry + 15).trim();
    }
  }

  return null;
}

const socket = dgram.createSocket("udp4");
socket.on("error", () => {});
socket.bind();

const pendingQueries = new Map<number, (name: string | null) => void>();

socket.on("message", msg => {
  if (msg.length < 2) return;
  pendingQueries.get(msg.readUInt16BE(0))?.(parseNbstatResponse(msg));
});

/** Asks a device directly for its NetBIOS name — works with zero router/DNS support, but only for Windows/SMB devices that still have NetBIOS enabled. */
export function queryNetbiosName(ip: string, timeoutMs: number): Promise<string | null> {
  const { packet, transactionId } = buildNbstatQuery();

  return new Promise(resolve => {
    const finish = (result: string | null) => {
      if (!pendingQueries.has(transactionId)) return;
      pendingQueries.delete(transactionId);
      clearTimeout(timer);
      resolve(result);
    };

    pendingQueries.set(transactionId, finish);
    const timer = setTimeout(() => finish(null), timeoutMs);
    socket.send(packet, NBSTAT_PORT, ip, err => { if (err) finish(null); });
  });
}
