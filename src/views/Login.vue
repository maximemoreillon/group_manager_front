<template>
  <div>
    <div style="position: absolute; top: 16px; right: 16px; width: 150px">
      <LocaleSelector />
    </div>
    <v-row justify="center">
      <v-col cols="auto">
        <div class="text-center mt-12">
          <v-icon size="144">mdi-account-multiple</v-icon>
          <div class="text-h5">Group manager</div>
        </div>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="auto">
        <v-card width="30em">
          <v-card-title>{{ $t("Sign in") }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <v-btn
                  v-if="oidcEnabled"
                  block
                  size="large"
                  variant="outlined"
                  :loading="oidcLoading"
                  @click="signInWithOidc"
                >
                  <v-icon start>mdi-openid</v-icon>
                  {{ $t("Sign in with SSO") }}
                </v-btn>
              </v-col>
            </v-row>

            <!-- Divider between OIDC and password login -->
            <v-row v-if="oidcEnabled && passwordEnabled">
              <v-col>
                <v-divider>
                  {{ $t("or") }}
                </v-divider>
              </v-col>
            </v-row>

            <!-- Username / password -->
            <v-form v-if="passwordEnabled" @submit.prevent="submit">
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="identifier"
                    :label="$t('Username')"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    autocomplete="username"
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="password"
                    :label="$t('Password')"
                    type="password"
                    prepend-inner-icon="mdi-lock-outline"
                    variant="outlined"
                    autocomplete="current-password"
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="loading"
                  >
                    <v-icon start>mdi-login</v-icon>
                    {{ $t("Sign in") }}
                  </v-btn>
                </v-col>
              </v-row>
              <v-row v-if="error">
                <v-col>
                  <v-alert color="error" variant="tonal">
                    {{ error }}
                  </v-alert>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { isOidcConfigured, startOidcLogin } from "@/composables/useOidc";
import LocaleSelector from "@/components/LocaleSelector.vue";

const route = useRoute();
const router = useRouter();
const { login } = useAuth();

const identifier = ref("");
const password = ref("");
const loading = ref(false);
const oidcLoading = ref(false);
const error = ref<string | null>(null);

const oidcEnabled = isOidcConfigured();
const passwordEnabled = !!import.meta.env.VITE_LOGIN_URL;

async function signInWithOidc() {
  oidcLoading.value = true;
  try {
    const redirect = route.query.redirect as string | undefined;
    await startOidcLogin(redirect);
    // startOidcLogin redirects the browser — no further code runs
  } catch (err: any) {
    error.value = err.message ?? "Failed to initiate SSO login";
    oidcLoading.value = false;
  }
}

async function submit() {
  error.value = null;
  loading.value = true;
  try {
    await login(identifier.value, password.value);
    const redirect = route.query.redirect as string | undefined;
    router.push(
      redirect || { name: "UserGroups", params: { user_id: "self" } },
    );
  } catch (err: any) {
    error.value = err.response?.data ?? err.message ?? "Login failed";
  } finally {
    loading.value = false;
  }
}
</script>
