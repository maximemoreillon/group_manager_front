<template>
  <v-data-table-server
    :items="groups"
    :headers="headers"
    :loading="loading"
    :items-length="total"
    :items-per-page="50"
    :items-per-page-options="itemsPerPageOptions"
    @update:options="loadGroups"
  >
    <template #item.avatar="{ item }">
      <v-img
        v-if="item.avatar_src"
        contain
        width="2em"
        height="2em"
        :src="item.avatar_src"
      />
      <v-icon v-else>mdi-account-multiple</v-icon>
    </template>

    <template #item.name="{ item }">
      <router-link :to="{ name: 'Group', params: { group_id: item._id } }">{{
        item.name
      }}</router-link>
    </template>

    <template #item.restricted="{ item }">
      <v-icon v-if="item.restricted">mdi-lock</v-icon>
    </template>
    <template #item.hidden="{ item }">
      <v-icon v-if="item.hidden">mdi-eye-off</v-icon>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/api";
import { avatarHeader, hiddenHeader, restrictedHeader } from "@/common";

const props = defineProps<{
  as: string;
  shallow: boolean;
  official: boolean;
  nonofficial: boolean;
}>();

const route = useRoute();
const loading = ref(false);
const groups = ref<any[]>([]);
const total = ref(0);
const itemsPerPageOptions = [50, 100, 500, -1];

const headers = [
  avatarHeader,
  { key: "name", title: "Name", sortable: false },
  restrictedHeader,
  hiddenHeader,
] as const;

const userId = computed(() => route.params.user_id as string);

let lastOptions = { page: 1, itemsPerPage: 50 };

async function loadGroups({
  page,
  itemsPerPage,
}: {
  page: number;
  itemsPerPage: number;
}) {
  lastOptions = { page, itemsPerPage };
  loading.value = true;
  try {
    const { data } = await api.get(`/v3/${props.as}s/${userId.value}/groups`, {
      params: {
        batch_size: itemsPerPage,
        start_index: (page - 1) * itemsPerPage,
        shallow: props.shallow ? true : undefined,
        official: props.official ? true : undefined,
        nonofficial: props.nonofficial ? true : undefined,
      },
    });
    total.value = data.count;
    groups.value = data.items;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

watch(
  [() => props.shallow, () => props.official, () => props.nonofficial, userId],
  () => loadGroups(lastOptions),
);
</script>
