import mdnsFactory from "multicast-dns";
import type { Answer, RecordType } from "dns-packet";

export type MdnsResponse = { answers: Answer[]; additionals: Answer[] };
type ResponseListener = (response: MdnsResponse) => void;

const mdns = mdnsFactory();
// Ignore socket errors (e.g. the port's already taken) instead of crashing the server.
mdns.on("error", () => {});

// One shared listener set, not one per query — avoids Node's max-listeners
// warning when many devices are looked up at once.
const listeners = new Set<ResponseListener>();

mdns.on("response", response => {
  const normalized: MdnsResponse = { answers: response.answers ?? [], additionals: response.additionals ?? [] };
  for (const listener of listeners) listener(normalized);
});

/**
 * Sends an mDNS question and calls `onResponse` for every reply until the
 * caller unsubscribes. Hostname lookup (stop at the first match) and service
 * enrichment (collect the whole window) both build on this.
 */
export function subscribeMdns(question: { name: string; type: RecordType }, onResponse: ResponseListener): () => void {
  listeners.add(onResponse);
  mdns.query({ questions: [question] });
  return () => listeners.delete(onResponse);
}
