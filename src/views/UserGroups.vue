<template>
  <v-card max-width="60em" class="mx-auto">
    <v-toolbar flat>
      <v-toolbar-title v-if="user">
        <span>{{ user.display_name }}</span>
      </v-toolbar-title>
      <v-toolbar-title v-else>
        <v-progress-circular indeterminate />
      </v-toolbar-title>
      <v-spacer />
      <v-btn exact :to="{ name: 'CreateGroup' }" color="primary">
        <v-icon start>mdi-account-multiple-plus</v-icon>
        {{ $t("Create group") }}
      </v-btn>
      <template #extension>
        <v-tabs v-model="relationTab">
          <v-tab value="member">{{ $t("As member") }}</v-tab>
          <v-tab value="administrator">{{ $t("As administrator") }}</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <v-divider />

    <v-card-text>
      <v-window v-model="relationTab">
        <v-window-item
          v-for="relationship in ['member', 'administrator']"
          :key="relationship"
          :value="relationship"
        >
          <v-row justify="end">
            <v-col cols="auto">
              <v-select
                v-model="officiality"
                :items="officialityItems"
                hide-details
                density="compact"
                variant="outlined"
                style="width: 150px"
                class="mr-2"
              />
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <v-switch v-model="subgroups" label="Subgroups" hide-details />
            </v-col>
          </v-row>
          <GroupsOfUser
            :key="officiality"
            :as="relationship"
            :official="officiality === 'official'"
            :nonofficial="officiality === 'nonofficial'"
            :shallow="!subgroups"
          />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import GroupsOfUser from "@/components/GroupsOfUser.vue";
import api from "@/api";

const { t } = useI18n();
const route = useRoute();

const user = ref<{ display_name: string } | null>(null);
const relationTab = ref("member");
const officiality = ref("official");
const subgroups = ref(false);

const officialityItems = computed(() => [
  { title: t("Official"), value: "official" },
  { title: t("Non-official"), value: "nonofficial" },
]);

const userId = computed(() => route.params.user_id as string);

// const userProfileUrl = computed(() => {
//   const base = import.meta.env.VITE_USER_MANAGER_FRONT_URL;
//   if (!base) return undefined;
//   return `${base}/users/${userId.value}`;
// });

async function getUser() {
  try {
    const { data } = await api.get(`/v3/users/${userId.value}`);
    user.value = data;
  } catch (error) {
    console.error(error);
  }
}

watch(userId, getUser);
onMounted(getUser);
</script>
