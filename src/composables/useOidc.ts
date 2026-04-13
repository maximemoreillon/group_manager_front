const VERIFIER_KEY = "oidc_code_verifier";
const STATE_KEY = "oidc_state";
const REDIRECT_KEY = "oidc_redirect";

// Cache the discovery document for the session to avoid redundant fetches
let discoveryCache: Record<string, any> | null = null;

async function fetchDiscovery(): Promise<Record<string, any>> {
  if (discoveryCache) return discoveryCache;
  const authority = import.meta.env.VITE_OIDC_AUTHORITY;
  const res = await fetch(`${authority}/.well-known/openid-configuration`);
  if (!res.ok) throw new Error("Failed to fetch OIDC discovery document");
  discoveryCache = await res.json();
  return discoveryCache!;
}

function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateCodeVerifier(): Promise<string> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

export function isOidcConfigured(): boolean {
  return !!(
    import.meta.env.VITE_OIDC_AUTHORITY && import.meta.env.VITE_OIDC_CLIENT_ID
  );
}

export async function startOidcLogin(redirectPath?: string): Promise<void> {
  const authority = import.meta.env.VITE_OIDC_AUTHORITY;
  const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
  const scope =
    import.meta.env.VITE_OIDC_SCOPE || "openid profile email";

  const discovery = await fetchDiscovery();

  const verifier = await generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));

  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  if (redirectPath) sessionStorage.setItem(REDIRECT_KEY, redirectPath);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${window.location.origin}/oidc-callback`,
    scope,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });

  window.location.href = `${discovery.authorization_endpoint}?${params}`;
}

export async function handleOidcCallback(
  code: string,
  state: string,
): Promise<{ accessToken: string; redirectPath: string | null }> {
  const storedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  const redirectPath = sessionStorage.getItem(REDIRECT_KEY);

  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);

  if (state !== storedState) throw new Error("State mismatch — possible CSRF");
  if (!verifier) throw new Error("Missing PKCE code verifier");

  const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
  const discovery = await fetchDiscovery();

  const response = await fetch(discovery.token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${window.location.origin}/oidc-callback`,
      client_id: clientId,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Token exchange failed: ${body}`);
  }

  const tokens = await response.json();
  return { accessToken: tokens.access_token, redirectPath };
}
