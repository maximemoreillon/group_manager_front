<template>
  <GroupsTable
    :items="groups"
    :extra-headers="props.currentUserHasAdminRights ? [{ key: 'delete', title: '', sortable: false }] : undefined"
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

    <template #item.delete="{ item }">
      <v-btn
        color="error"
        @click="pendingRemove = item"
        icon="mdi-account-multiple-remove"
        variant="plain"
      />
    </template>
  </GroupsTable>

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
import GroupsTable from "@/components/GroupsTable.vue";
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
const pendingRemove = ref<any>(null);
const itemsPerPageOptions = [50, 100, 500, -1];

let lastOptions = { page: 1, itemsPerPage: 50 };

const groupId = computed(() => route.params.group_id as string);

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
