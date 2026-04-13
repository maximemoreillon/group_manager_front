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
          <v-switch
            v-model="subgroups"
            label="Include subgroups"
            hide-details
            @update:model-value="reload"
          />
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <v-checkbox
            label="Official"
            v-model="official"
            hide-details
            @update:model-value="reload"
          />
        </v-col>
        <v-col cols="auto">
          <v-checkbox
            label="Non-official"
            v-model="nonofficial"
            hide-details
            @update:model-value="reload"
          />
        </v-col>
      </v-row>
    </v-form>

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
        <v-icon v-if="item.official">mdi-check</v-icon>
      </template>

      <template #item.hidden="{ item }">
        <v-icon v-if="item.hidden">mdi-eye-off</v-icon>
      </template>
    </v-data-table-server>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import api from "@/api";
import {
  avatarHeader,
  hiddenHeader,
  officialHeader,
  restrictedheader,
} from "@/common";

defineEmits<{ selection: [group: any] }>();

const loading = ref(false);
const search = ref("");
const subgroups = ref(true);
const official = ref(true);
const nonofficial = ref(true);
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
  groups.value = [];
  try {
    const params: Record<string, any> = {
      search: search.value,
      batch_size: itemsPerPage,
      start_index: (page - 1) * itemsPerPage,
    };
    if (!subgroups.value) params.shallow = true;
    if (!official.value) params.nonofficial = true;
    if (!nonofficial.value) params.official = true;

    const { data } = await api.get("/v3/groups", { params });
    total.value = data.count;
    groups.value = data.items;
  } catch {
    alert("Failed to search groups");
  } finally {
    loading.value = false;
  }
}

function searchGroups() {
  loadGroups({ ...lastOptions, page: 1 });
}

function reload() {
  loadGroups(lastOptions);
}
</script>
