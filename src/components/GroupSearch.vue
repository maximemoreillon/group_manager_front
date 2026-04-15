<template>
  <div>
    <v-form @submit.prevent="searchGroups" class="py-2">
      <v-row align="center">
        <v-col>
          <v-text-field
            v-model="search"
            :label="$t('Search')"
            hide-details
            append-inner-icon="mdi-magnify"
            @click:append-inner="searchGroups"
          />
          <v-btn
            type="submit"
            icon
            variant="plain"
            :loading="loading"
            style="display: none"
          />
        </v-col>
      </v-row>
      <v-row align="center">
        <v-col cols="auto">
          <v-select
            :label="$t('Officiality')"
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

    <GroupsTable
      :items="groups"
      :loading="loading"
      :items-length="total"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      @update:options="loadGroups"
    />
  </div>

  <v-snackbar v-model="errorSnackbar" color="error" timeout="3000">
    {{ t("Failed to search groups") }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/api";
import GroupsTable from "@/components/GroupsTable.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const errorSnackbar = ref(false);
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
    errorSnackbar.value = true;
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
