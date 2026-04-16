<template>
  <v-card max-width="60em" class="mx-auto">
    <template #prepend>
      <v-avatar start color="transparent">
        <template v-if="user">
          <v-img :src="user.avatar_src" v-if="user.avatar_src" />
          <v-icon v-else>mdi-account-multiple</v-icon>
        </template>
        <v-progress-circular v-else indeterminate />
      </v-avatar>
    </template>
    <template #title>
      <span v-if="user">{{ user.display_name }}</span>
    </template>
    <template #append>
      <v-btn exact :to="{ name: 'CreateGroup' }" color="primary">
        <v-icon start>mdi-account-multiple-plus</v-icon>
        <span>{{ $t("Create group") }}</span>
      </v-btn>
    </template>
    <v-tabs v-model="relationTab">
      <v-tab value="member">
        <!-- <v-icon start> mdi-account </v-icon> -->
        <span>{{ $t("As member") }}</span>
      </v-tab>
      <v-tab value="administrator">
        <!-- <v-icon start> mdi-account-star </v-icon> -->
        <span>{{ $t("As administrator") }}</span>
      </v-tab>
    </v-tabs>
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
              <v-switch
                v-model="subgroups"
                :label="$t('Include subgroups')"
                hide-details
              />
            </v-col>
          </v-row>
          <GroupsOfUser
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
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import GroupsOfUser from "@/components/GroupsOfUser.vue";
import api from "@/api";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const user = ref<{ display_name: string; avatar_src?: string } | null>(null);
const relationTab = ref((route.query.relation as string) || "member");
const officiality = ref((route.query.officiality as string) || "official");
const subgroups = ref(route.query.subgroups === "true");

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

watch([relationTab, officiality, subgroups], ([tab, off, sub]) => {
  router.replace({
    query: {
      ...route.query,
      relation: tab,
      officiality: off,
      subgroups: String(sub),
    },
  });
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
