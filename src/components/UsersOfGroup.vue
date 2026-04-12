<template>
  <v-data-table-server
    :loading="loading"
    :items="members"
    :headers="headers"
    :items-length="total"
    :items-per-page="50"
    :items-per-page-options="itemsPerPageOptions"
    @update:options="loadMembers"
  >
    <template #top>
      <v-row align="center">
        <v-col cols="auto">
          <AddUserDialog
            v-if="props.currentUserHasAdminRights"
            :as="props.user_type"
            @usersChanged="$emit('usersChanged')"
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
        color="#c00000"
        @click="removeUser(item)"
        variant="plain"
      />
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import AddUserDialog from "@/components/AddUserDialog.vue";
import MembersExcelExport from "@/components/MembersExcelExport.vue";
import api from "@/api";
import { avatarHeader } from "@/common";

const props = defineProps<{
  user_type: string;
  currentUserHasAdminRights: boolean;
}>();

const emit = defineEmits<{ usersChanged: [] }>();

const route = useRoute();
const loading = ref(false);
const members = ref<any[]>([]);
const total = ref(0);
const itemsPerPageOptions = [50, 100, 500, -1];

const groupId = computed(() => route.params.group_id as string);

const baseHeaders = [
  avatarHeader,
  { key: "name", title: "Name", sortable: false },
];
const adminHeaders = [{ key: "remove", title: "Remove", sortable: false }];

const headers = computed(() => {
  let h = [...baseHeaders];
  if (members.value.length && members.value[0].role)
    h.push({ key: "role", title: "Role", sortable: false });
  if (props.currentUserHasAdminRights) h = [...h, ...adminHeaders];
  return h;
});

async function loadMembers({
  page,
  itemsPerPage,
}: {
  page: number;
  itemsPerPage: number;
}) {
  loading.value = true;
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

async function removeUser(user: any) {
  if (!props.currentUserHasAdminRights)
    return alert("This action can only be performed by group administrators");
  if (!confirm(`Remove user ${user.display_name}?`)) return;
  try {
    await api.delete(
      `/v3/groups/${groupId.value}/${props.user_type}/${user._id}`,
    );
    emit("usersChanged");
  } catch (error) {
    console.error(error);
  }
}
</script>
