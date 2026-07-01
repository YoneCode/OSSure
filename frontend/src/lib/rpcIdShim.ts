// Bradbury's JSON-RPC server currently rejects requests where `id` is a string
// (even though JSON-RPC 2.0 allows strings). Some transports in the browser
// stack (notably Privy's embedded-wallet dispatch) send string ids, which
// produces "Parse error as single request: json: cannot unmarshal string into
// Go struct field Request.id of type int".
//
// This install-once shim wraps window.fetch and, for any request whose URL is
// on the GenLayer / Bradbury RPC host, rewrites string ids to integers before
// the request leaves the browser. All other requests are untouched.

const RPC_HOST_MATCHERS = [
  "rpc-bradbury.genlayer.com",
  "rpc.testnet-chain.genlayer.com",
  "genlayer.com/api",
];

let installed = false;
let counter = 1;

function nextId(): number {
  // Wrap around to stay within safe int range without ever going negative.
  const id = counter;
  counter = (counter + 1) & 0x7fffffff || 1;
  return id;
}

function matchesRpcHost(url: string): boolean {
  return RPC_HOST_MATCHERS.some((m) => url.includes(m));
}

function normalizeBody(body: unknown): unknown {
  if (Array.isArray(body)) {
    return body.map((entry) => normalizeBody(entry));
  }
  if (body && typeof body === "object" && "jsonrpc" in body) {
    const b = body as { id?: unknown };
    if (typeof b.id !== "number") b.id = nextId();
  }
  return body;
}

export function installRpcIdShim(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url = "";
    try {
      url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url;
    } catch {
      return originalFetch(input, init);
    }

    if (!matchesRpcHost(url) || !init?.body || typeof init.body !== "string") {
      return originalFetch(input, init);
    }

    try {
      const parsed = JSON.parse(init.body);
      const normalized = normalizeBody(parsed);
      return originalFetch(input, { ...init, body: JSON.stringify(normalized) });
    } catch {
      // If it isn't JSON, let it through untouched.
      return originalFetch(input, init);
    }
  };
}
