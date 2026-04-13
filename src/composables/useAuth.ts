import { ref, computed } from "vue";

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

export function useAuth() {
  const accessToken = computed(() => tokens.value?.access_token);

  const currentUserId = computed(() => {
    const user = currentUser.value;
    if (!user) return undefined;
    return user._id || user.preferred_username || user.properties?._id;
  });

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
    setCurrentUser,
    setTokens,
  };
}
