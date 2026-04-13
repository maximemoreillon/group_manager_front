<template>
  <v-app>
    <!-- Authenticated layout -->
    <v-app-bar color="#333">
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        v-if="state === 'content'"
      />
      <v-app-bar-title> Group manager </v-app-bar-title>
      <template #append>
        <LocaleSelector />
        <v-btn icon="mdi-logout" @click="logout" />
      </template>
    </v-app-bar>
    <template v-if="state === 'content'">
      <v-navigation-drawer v-model="drawer">
        <v-list nav>
          <v-list-item
            v-for="(item, index) in nav"
            :key="`nav_item_${index}`"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            exact
          />
        </v-list>
        <template v-slot:append> </template>
      </v-navigation-drawer>

      <v-main>
        <v-container>
          <router-view />
        </v-container>
      </v-main>
    </template>

    <!-- Authentication wall -->
    <v-main v-else>
      <v-container
        fluid
        fill-height
        class="d-flex align-center justify-center"
        style="min-height: 100vh"
      >
        <v-col cols="12" sm="6" md="4" lg="3">
          <div class="text-center mb-8">
            <div class="text-h5">Group manager</div>
          </div>

          <div
            v-if="['initial', 'loading'].includes(state)"
            class="text-center"
          >
            <v-progress-circular indeterminate />
          </div>

          <v-form v-if="state === 'login'" @submit.prevent="login">
            <v-text-field
              v-model="identifier"
              label="Username"
              prepend-icon="mdi-account"
              autocomplete="username"
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              prepend-icon="mdi-lock"
              autocomplete="current-password"
            />
            <div class="text-center mt-4">
              <v-btn type="submit" :loading="loggingIn">
                <v-icon start>mdi-login</v-icon>
                Login
              </v-btn>
            </div>
            <v-alert v-if="loginError" color="error" class="mt-4">{{
              loginError
            }}</v-alert>
            <div
              v-if="loginHint"
              class="text-center mt-4 text-body-2"
              v-html="loginHint"
            />
          </v-form>
        </v-col>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/composables/useAuth";
import LocaleSelector from "@/components/LocaleSelector.vue";
import api from "@/api";

const { t } = useI18n();
const { currentUser, setCurrentUser, setTokens } = useAuth();

type AuthState = "initial" | "loading" | "login" | "content";

const state = ref<AuthState>("initial");
const drawer = ref(true);
const identifier = ref("");
const password = ref("");
const loggingIn = ref(false);
const loginError = ref<string | null>(null);
const loginHint = import.meta.env.VITE_LOGIN_HINT;

const nav = computed(() => [
  {
    title: t("My Groups"),
    to: { name: "UserGroups", params: { user_id: "self" } },
    icon: "mdi-account",
  },
  {
    title: t("Groups"),
    to: { name: "Groups" },
    icon: "mdi-account-multiple",
  },
  {
    title: t("Create group"),
    to: { name: "CreateGroup" },
    icon: "mdi-account-multiple-plus",
  },
  {
    title: t("About"),
    to: { name: "About" },
    icon: "mdi-information-outline",
  },
]);

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

async function identify() {
  state.value = "loading";

  const jwt = getStoredJwt();
  if (!jwt) {
    state.value = "login";
    return;
  }

  api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
  setTokens({ access_token: jwt });

  const identificationUrl = import.meta.env.VITE_IDENTIFICATION_URL;
  if (!identificationUrl) {
    state.value = "content";
    return;
  }

  try {
    const { data } = await api.get(identificationUrl);
    setCurrentUser(data);
    state.value = "content";
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearStoredJwt();
      delete api.defaults.headers.common["Authorization"];
    }
    state.value = "login";
  }
}

async function login() {
  loginError.value = null;
  loggingIn.value = true;
  try {
    const { data } = await api.post(import.meta.env.VITE_LOGIN_URL, {
      identifier: identifier.value,
      password: password.value,
    });
    if (!data.jwt) throw new Error("No JWT in response");
    localStorage.setItem("jwt", data.jwt);
    await identify();
  } catch (error: any) {
    loginError.value = error.response?.data ?? "Login failed";
  } finally {
    loggingIn.value = false;
  }
}

function logout() {
  clearStoredJwt();
  delete api.defaults.headers.common["Authorization"];
  setCurrentUser(null);
  setTokens(null);
  state.value = "login";
}

onMounted(identify);
</script>
