import { ref, computed } from "vue";
import api from "@/api";

interface User {
  _id?: string;
  username?: string;
  preferred_username?: string;
  display_name?: string;
  isAdmin?: boolean;
  profile?: Omit<User, "profile">;
  properties?: { _id?: string };
  avatar_src?: string;
}

interface Tokens {
  access_token?: string;
  [key: string]: unknown;
}

// Module-level state — shared across the app
const currentUser = ref<User | null>(null);
const tokens = ref<Tokens | null>(null);

// Prevents the response interceptor from redirecting during the identify() call
// (the router guard handles that case instead)
let isIdentifying = false;

function getStoredJwt(): string | null {
  const local = localStorage.getItem("jwt");
  if (local) return local;
  const match = document.cookie.match(/(?:^|;\s*)jwt=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function clearStoredJwt() {
  localStorage.removeItem("jwt");
  document.cookie = "jwt=; Max-Age=0; path=/";
}

function clearAuthState() {
  clearStoredJwt();
  delete api.defaults.headers.common["Authorization"];
  currentUser.value = null;
  tokens.value = null;
}

// Intercept 401 responses that occur mid-session (token expired after login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isIdentifying && tokens.value) {
      clearAuthState();
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/oidc-callback") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

async function identify(): Promise<boolean> {
  const jwt = getStoredJwt();
  if (!jwt) return false;

  api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
  tokens.value = { access_token: jwt };

  const identificationUrl = import.meta.env.VITE_IDENTIFICATION_URL;
  if (!identificationUrl) return true;

  isIdentifying = true;
  try {
    const { data } = await api.get(identificationUrl);
    currentUser.value = data?.profile ?? data;
    return true;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuthState();
    }
    return false;
  } finally {
    isIdentifying = false;
  }
}

async function login(identifier: string, password: string): Promise<void> {
  const { data } = await api.post(import.meta.env.VITE_LOGIN_URL, {
    identifier,
    password,
  });
  if (!data.jwt) throw new Error("No JWT in response");
  localStorage.setItem("jwt", data.jwt);
  await identify();
}

function logout() {
  clearAuthState();
}

export function useAuth() {
  const accessToken = computed(() => tokens.value?.access_token);

  const currentUserId = computed(() => {
    const user = currentUser.value;
    if (!user) return undefined;
    return user._id || user.preferred_username || user.properties?._id;
  });

  // Kept for backward compatibility with components that call setCurrentUser/setTokens
  function setCurrentUser(user: User | null) {
    currentUser.value = user?.profile ?? user;
  }

  function setTokens(newTokens: Tokens | null) {
    tokens.value = newTokens;
  }

  return {
    currentUser,
    tokens,
    accessToken,
    currentUserId,
    identify,
    login,
    logout,
    setCurrentUser,
    setTokens,
  };
}
