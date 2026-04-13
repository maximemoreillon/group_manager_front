<template>
  <GroupsTable
    :items="groups"
    :loading="loading"
    :items-length="total"
    :items-per-page="50"
    :items-per-page-options="itemsPerPageOptions"
    @update:options="loadGroups"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import api from "@/api";
import GroupsTable from "@/components/GroupsTable.vue";

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
