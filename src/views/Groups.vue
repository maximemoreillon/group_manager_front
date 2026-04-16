<template>
  <v-card max-width="60em" class="mx-auto">
    <template #prepend>
      <v-avatar start color="transparent">
        <v-icon>mdi-account-multiple</v-icon>
      </v-avatar>
    </template>
    <template #title>{{ $t("Groups") }}</template>
    <template #append>
      <v-btn exact :to="{ name: 'CreateGroup' }" color="primary">
        <v-icon start>mdi-account-multiple-plus</v-icon>
        {{ $t("Create group") }}
      </v-btn>
    </template>
    <v-tabs v-model="tab">
      <v-tab value="browse">
        <v-icon start>mdi-file-tree</v-icon>
        <span>{{ $t("Browse") }}</span>
      </v-tab>
      <v-tab value="search">
        <v-icon start>mdi-magnify</v-icon>
        <span>{{ $t("Search") }}</span>
      </v-tab>
    </v-tabs>
    <v-divider />
    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="browse">
          <GroupPicker
            :groupManagerApiUrl="groupManagerApiUrl"
            :accessToken="accessToken"
            @selection="groupSelected"
            :usersWithNoGroup="false"
          />
        </v-window-item>
        <v-window-item value="search">
          <GroupSearch />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  GroupPicker,
  type GroupItem,
} from "@moreillon/group-manager-vue-picker";
import { useAuth } from "@/composables/useAuth";
import GroupSearch from "@/components/GroupSearch.vue";

const route = useRoute();
const router = useRouter();
const { accessToken } = useAuth();
const tab = ref((route.query.tab as string) || "browse");
const groupManagerApiUrl = import.meta.env.VITE_GROUP_MANAGER_API_URL;

watch(tab, (value) => {
  router.replace({
    query: { ...route.query, tab: value !== "browse" ? value : undefined },
  });
});

function groupSelected(group: GroupItem) {
  router.push({ name: "Group", params: { group_id: group._id } });
}
</script>
