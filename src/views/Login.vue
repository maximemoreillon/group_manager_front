<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">
        <div class="text-center mb-6">
          <v-icon size="72">mdi-account-multiple</v-icon>
          <div class="text-h5 mt-2">Group manager</div>
        </div>

        <v-card>
          <v-card-title class="pt-6 px-6">{{ $t("Sign in") }}</v-card-title>
          <v-card-text class="px-6 pb-6">
            <v-form @submit.prevent="submit">
              <v-text-field
                v-model="identifier"
                :label="$t('Username')"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                autocomplete="username"
                class="mb-2"
                hide-details
              />
              <v-text-field
                v-model="password"
                :label="$t('Password')"
                type="password"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                autocomplete="current-password"
                hide-details
              />
              <v-alert v-if="error" color="error" variant="tonal" class="mt-4">
                {{ error }}
              </v-alert>
              <div
                v-if="loginHint"
                class="text-center mt-4 text-body-2"
                v-html="loginHint"
              />
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="mt-6"
                :loading="loading"
              >
                <v-icon start>mdi-login</v-icon>
                {{ $t("Sign in") }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const router = useRouter();
const { login } = useAuth();

const identifier = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const loginHint = import.meta.env.VITE_LOGIN_HINT;

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
