// Public entry point for "what is this host connected through right now".
// The OS-specific work lives in ./platform.
import { getNetworkProvider } from "./platform";

export type { ConnectionKind, CurrentConnection } from "./platform";

export const getCurrentConnection = () => getNetworkProvider().getCurrentConnection();
