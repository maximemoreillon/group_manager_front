<template>
  <v-data-table-server
    :loading="loading"
    :items="members"
    :headers="headers"
    :items-length="total"
    :items-per-page-options="itemsPerPageOptions"
    v-model:items-per-page="tableOptions.itemsPerPage"
    v-model:page="tableOptions.page"
  >
    <template #top>
      <v-row align="center">
        <v-col cols="auto">
          <AddUserDialog
            v-if="props.currentUserHasAdminRights"
            :as="props.user_type"
            @usersChanged="loadMembers"
          />
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <MembersExcelExport :user_type="props.user_type" />
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
      <v-icon v-else>mdi-account</v-icon>
    </template>

    <template #item.name="{ item }">
      <router-link :to="{ name: 'UserGroups', params: { user_id: item._id } }">
        {{ item.display_name }}
      </router-link>
    </template>

    <template #item.remove="{ item }">
      <v-btn
        icon="mdi-account-remove"
        color="error"
        @click="pendingRemove = item"
        variant="plain"
      />
    </template>
  </v-data-table-server>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>

  <v-dialog
    :model-value="!!pendingRemove"
    max-width="400"
    @update:model-value="pendingRemove = null"
  >
    <v-card>
      <v-card-title>{{ $t("Remove user") }}</v-card-title>
      <v-card-text>{{
        $t("Remove {name}?", { name: pendingRemove?.display_name })
      }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="pendingRemove = null">{{ $t("Cancel") }}</v-btn>
        <v-btn color="error" @click="confirmRemove">{{ $t("Remove") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import AddUserDialog from "@/components/AddUserDialog.vue";
import MembersExcelExport from "@/components/MembersExcelExport.vue";
import api from "@/api";

const props = defineProps<{
  user_type: string;
  currentUserHasAdminRights: boolean;
}>();

const { t } = useI18n();
const route = useRoute();
const loading = ref(false);
const members = ref<any[]>([]);
const total = ref(0);
const pendingRemove = ref<any>(null);
const snackbar = ref({ show: false, message: "", color: "" });
const itemsPerPageOptions = [50, 100, 500, -1];

const tableOptions = ref({
  page: 1,
  itemsPerPage: 50,
});

const groupId = computed(() => route.params.group_id as string);

const headers = computed(() => {
  const result = [
    {
      key: "avatar",
      title: "",
      width: "50px",
      sortable: false,
      align: "center" as const,
    },
    { key: "name", title: t("Name"), sortable: false },
  ];
  if (members.value.length && members.value[0].role)
    result.push({ key: "role", title: t("Role"), sortable: false } as any);
  if (props.currentUserHasAdminRights)
    result.push({ key: "remove", title: "", sortable: false } as any);
  return result;
});

async function loadMembers() {
  loading.value = true;
  const { itemsPerPage, page } = tableOptions.value;
  try {
    const { data } = await api.get(
      `/v3/groups/${groupId.value}/${props.user_type}`,
      {
        params: {
          batch_size: itemsPerPage,
          start_index: (page - 1) * itemsPerPage,
        },
      },
    );
    total.value = data.count;
    members.value = data.items;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

async function confirmRemove() {
  const user = pendingRemove.value;
  pendingRemove.value = null;
  try {
    await api.delete(
      `/v3/groups/${groupId.value}/${props.user_type}/${user._id}`,
    );
    loadMembers();
  } catch (error) {
    console.error(error);
    snackbar.value = { show: true, message: t("Failed to remove user"), color: "error" };
  }
}

watch(tableOptions, loadMembers, { deep: true });

onMounted(loadMembers);
</script>
