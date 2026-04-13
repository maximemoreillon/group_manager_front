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
    <template #top>
      <v-row align="center">
        <v-col cols="auto">
          <AddGroupDialog
            v-if="props.currentUserHasAdminRights"
            :as="props.group_type"
            @groupAdd="addGroup"
          />
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <v-switch
            v-model="includeSubgroups"
            :label="$t('Include subgroups')"
            hide-details
            @update:model-value="reload"
          />
        </v-col>
      </v-row>
    </template>

    <template #item.avatar="{ item }">
      <v-img
        v-if="item.avatar_src"
        contain
        width="2.5em"
        height="2.5em"
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

    <template #item.official="{ item }">
      <v-icon v-if="item.official">mdi-check-decagram</v-icon>
    </template>

    <template #item.delete="{ item }">
      <v-btn
        color="error"
        @click="pendingRemove = item"
        icon="mdi-account-multiple-remove"
        variant="plain"
      />
    </template>
  </v-data-table-server>

  <v-dialog :model-value="!!pendingRemove" max-width="400" @update:model-value="pendingRemove = null">
    <v-card>
      <v-card-title>{{ $t("Remove group") }}</v-card-title>
      <v-card-text>{{ $t("Remove {name}?", { name: pendingRemove?.name }) }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="pendingRemove = null">{{ $t("Cancel") }}</v-btn>
        <v-btn color="error" @click="confirmRemove">{{ $t("Remove") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import AddGroupDialog from "@/components/AddGroupDialog.vue";
import api from "@/api";
import { avatarHeader, hiddenHeader, restrictedHeader } from "@/common";

const props = defineProps<{
  group_type: string;
  currentUserHasAdminRights: boolean;
}>();

const emit = defineEmits<{ groupsChanged: [] }>();

const route = useRoute();
const loading = ref(false);
const groups = ref<any[]>([]);
const total = ref(0);
const includeSubgroups = ref(true);
const pendingRemove = ref<any>(null);
const itemsPerPageOptions = [50, 100, 500, -1];

let lastOptions = { page: 1, itemsPerPage: 50 };

const groupId = computed(() => route.params.group_id as string);

const baseHeaders = [
  avatarHeader,
  { key: "name", title: "Name", sortable: false },
  { key: "official", title: "Official", sortable: false, align: "center" },
  restrictedHeader,
  hiddenHeader,
] as const;
const adminHeaders = [{ key: "delete", title: "", sortable: false }];

const headers = computed(() =>
  props.currentUserHasAdminRights
    ? [...baseHeaders, ...adminHeaders]
    : baseHeaders,
);

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
  const url =
    props.group_type === "parent"
      ? `/v3/groups/${groupId.value}/parents`
      : `/v3/groups/${groupId.value}/groups`;
  try {
    const { data } = await api.get(url, {
      params: {
        batch_size: itemsPerPage,
        start_index: (page - 1) * itemsPerPage,
        direct: includeSubgroups.value ? undefined : true,
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

function reload() {
  loadGroups(lastOptions);
}

async function addGroup(group: { _id: string }) {
  let url: string;
  let body: object;
  if (props.group_type === "parent") {
    url = `/v3/groups/${group._id}/groups`;
    body = { group_id: groupId.value };
  } else {
    url = `/v3/groups/${groupId.value}/groups`;
    body = { group_id: group._id };
  }
  try {
    await api.post(url, body);
    emit("groupsChanged");
  } catch (error) {
    console.error(error);
  }
}

async function confirmRemove() {
  const group = pendingRemove.value;
  pendingRemove.value = null;
  const url =
    props.group_type === "parent"
      ? `/v3/groups/${group._id}/groups/${groupId.value}`
      : `/v3/groups/${groupId.value}/groups/${group._id}`;
  try {
    await api.delete(url);
    emit("groupsChanged");
  } catch (error) {
    console.error(error);
  }
}
</script>
