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
          <v-switch
            v-model="includeSubgroups"
            label="Include subgroups"
            hide-details
            @update:model-value="reload"
          />
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <AddGroupDialog :as="props.group_type" @groupAdd="addGroup" />
        </v-col>
      </v-row>
    </template>

    <template #item.image="{ item }">
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
      <v-icon v-if="item.restricted">mdi-check</v-icon>
    </template>

    <template #item.official="{ item }">
      <v-icon v-if="item.official">mdi-check</v-icon>
    </template>

    <template #item.delete="{ item }">
      <v-btn icon color="#c00000" @click="removeGroup(item)">
        <v-icon>mdi-account-multiple-remove</v-icon>
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import AddGroupDialog from "@/components/AddGroupDialog.vue";
import api from "@/api";

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
const itemsPerPageOptions = [50, 100, 500, -1];

// Keep last options for reload when includeSubgroups changes
let lastOptions = { page: 1, itemsPerPage: 50 };

const groupId = computed(() => route.params.group_id as string);

const baseHeaders = [
  { key: "image", title: "", width: "50px", sortable: false },
  { key: "name", title: "Name", sortable: false },
  { key: "official", title: "Official", sortable: false },
  { key: "restricted", title: "Restricted", sortable: false },
];
const adminHeaders = [{ key: "delete", title: "Delete", sortable: false }];

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
  if (!props.currentUserHasAdminRights)
    return alert("This action can only be performed by group administrators");
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

async function removeGroup(group: any) {
  if (!props.currentUserHasAdminRights)
    return alert("This action can only be performed by group administrators");
  if (!confirm(`Remove group ${group.name}?`)) return;
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
