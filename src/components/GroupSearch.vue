<template>
  <div>
    <v-form @submit.prevent="searchGroups">
      <v-row align="center" dense>
        <v-col>
          <v-text-field v-model="search" label="Group name" hide-details />
        </v-col>
        <v-col cols="auto">
          <v-btn type="submit" icon variant="plain" :loading="loading">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row align="center" dense>
        <v-col cols="auto">
          <v-select
            v-model="officiality"
            :items="officialityItems"
            hide-details
            density="compact"
            variant="outlined"
            style="width: 150px"
          />
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <v-switch
            v-model="subgroups"
            :label="t('Include subgroups')"
            hide-details
          />
        </v-col>
      </v-row>
    </v-form>

    <v-data-table-server
      :items="groups"
      :headers="headers"
      :loading="loading"
      :items-length="total"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
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
        <span
          class="text-primary cursor-pointer"
          @click="$emit('selection', item)"
          >{{ item.name }}</span
        >
      </template>

      <template #item.restricted="{ item }">
        <v-icon v-if="item.restricted">mdi-lock</v-icon>
      </template>

      <template #item.official="{ item }">
        <v-icon v-if="item.official">mdi-check-decagram</v-icon>
      </template>

      <template #item.hidden="{ item }">
        <v-icon v-if="item.hidden">mdi-eye-off</v-icon>
      </template>
    </v-data-table-server>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/api";
import {
  avatarHeader,
  hiddenHeader,
  officialHeader,
  restrictedheader,
} from "@/common";

defineEmits<{ selection: [group: any] }>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const search = ref((route.query.search as string) || "");
const subgroups = ref(route.query.subgroups !== "false");
const officiality = ref((route.query.officiality as string) || "all");
const page = ref(Number(route.query.page) || 1);
const itemsPerPage = ref(Number(route.query.itemsPerPage) || 50);

const officialityItems = computed(() => [
  { title: t("All"), value: "all" },
  { title: t("Official"), value: "official" },
  { title: t("Non-official"), value: "nonofficial" },
]);
const groups = ref<any[]>([]);
const total = ref(0);
const itemsPerPageOptions = [50, 100, 500, -1];

const headers = [
  avatarHeader,
  { key: "name", title: "Name", sortable: false },
  officialHeader,
  restrictedheader,
  hiddenHeader,
];

async function loadGroups({
  page: p,
  itemsPerPage: ipp,
}: {
  page: number;
  itemsPerPage: number;
}) {
  loading.value = true;
  groups.value = [];
  try {
    const params: Record<string, any> = {
      search: search.value,
      batch_size: ipp,
      start_index: (p - 1) * ipp,
    };
    if (!subgroups.value) params.shallow = true;
    if (officiality.value === "official") params.official = true;
    if (officiality.value === "nonofficial") params.nonofficial = true;

    const { data } = await api.get("/v3/groups", { params });
    total.value = data.count;
    groups.value = data.items;
  } catch {
    alert("Failed to search groups");
  } finally {
    loading.value = false;
  }
}

function syncQuery() {
  router.replace({
    query: {
      ...route.query,
      search: search.value || undefined,
      officiality: officiality.value !== "all" ? officiality.value : undefined,
      subgroups: !subgroups.value ? "false" : undefined,
      page: page.value !== 1 ? String(page.value) : undefined,
      itemsPerPage:
        itemsPerPage.value !== 50 ? String(itemsPerPage.value) : undefined,
    },
  });
}

function searchGroups() {
  page.value = 1;
  syncQuery();
  loadGroups({ page: page.value, itemsPerPage: itemsPerPage.value });
}

watch([officiality, subgroups], () => {
  syncQuery();
  loadGroups({ page: page.value, itemsPerPage: itemsPerPage.value });
});

watch([page, itemsPerPage], () => {
  syncQuery();
});
</script>
