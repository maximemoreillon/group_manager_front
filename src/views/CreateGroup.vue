<template>
  <v-card max-width="30em" class="mx-auto">
    <v-toolbar flat>
      <v-toolbar-title>
        <v-avatar start color="transparent">
          <v-icon>mdi-account-multiple-plus</v-icon>
        </v-avatar>
        {{ $t("Create group") }}
      </v-toolbar-title>
    </v-toolbar>
    <v-divider />
    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="createGroup">
        <v-row align="center">
          <v-col>
            <v-text-field
              v-model="group.name"
              label="Name"
              :rules="nameRules"
              required
            />
          </v-col>
          <v-col cols="auto">
            <v-btn
              type="submit"
              :disabled="!valid"
              :loading="creating"
              color="primary"
            >
              <v-icon start>mdi-account-multiple-plus</v-icon>
              {{ $t("Create") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/api";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const form = ref();
const valid = ref(false);
const creating = ref(false);
const group = ref({ name: "" });
const nameRules = [(v: string) => !!v || t("Name is required")];

async function createGroup() {
  const { valid: isValid } = await form.value.validate();
  if (!isValid) return;
  creating.value = true;
  try {
    const parent = route.query.parent as string | undefined;
    const { data } = await api.post("/v3/groups", { ...group.value, parent });
    router.push({ name: "Group", params: { group_id: data._id } });
  } catch (error: any) {
    console.error(error);
  } finally {
    creating.value = false;
  }
}
</script>
