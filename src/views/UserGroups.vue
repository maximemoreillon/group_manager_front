<template>
  <v-card max-width="60em" class="mx-auto">
    <v-toolbar flat>
      <v-toolbar-title v-if="user">
        <a v-if="userProfileUrl" :href="userProfileUrl">{{
          user.display_name
        }}</a>
        <span v-else>{{ user.display_name }}</span>
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
        <v-spacer />

        <!-- TODO: mr-4 not nice -->
        <v-switch
          v-model="subgroups"
          label="Subgroups"
          hide-details
          class="mr-4"
        />
      </template>
    </v-toolbar>
    <v-divider />
    <v-card-text>
      <v-window v-model="relationTab">
        <v-window-item
          v-for="relationship in ['member', 'administrator']"
          :key="`as_${relationship}`"
          :value="relationship"
        >
          <v-card variant="outlined">
            <v-toolbar flat>
              <v-tabs v-model="officialityTab">
                <v-tab value="official">{{ $t("Official") }}</v-tab>
                <v-tab value="nonofficial">{{ $t("Non-official") }}</v-tab>
              </v-tabs>
            </v-toolbar>
            <v-divider />
            <v-card-text>
              <v-window v-model="officialityTab">
                <v-window-item
                  v-for="officiality in ['official', 'nonofficial']"
                  :key="`as_${relationship}_${officiality}`"
                  :value="officiality"
                >
                  <GroupsOfUser
                    :official="officiality === 'official'"
                    :nonofficial="officiality === 'nonofficial'"
                    :shallow="!subgroups"
                    :as="relationship"
                  />
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import GroupsOfUser from "@/components/GroupsOfUser.vue";
import api from "@/api";

const route = useRoute();

const user = ref<{ display_name: string } | null>(null);
const relationTab = ref("member");
const officialityTab = ref("official");
const subgroups = ref(false);

const userId = computed(() => route.params.user_id as string);
const userProfileUrl = computed(() => {
  const base = import.meta.env.VITE_USER_MANAGER_FRONT_URL;
  if (!base) return undefined;
  return `${base}/users/${userId.value}`;
});

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
