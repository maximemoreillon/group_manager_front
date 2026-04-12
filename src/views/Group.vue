<template>
  <v-row justify="center" v-if="loading">
    <v-col cols="auto">
      <v-progress-circular indeterminate color="primary" size="50" />
    </v-col>
  </v-row>
  <template v-else-if="group">
    <v-row>
      <v-col>
        <!-- Group metadata -->
        <v-card variant="outlined">
          <!-- <v-card-title>{{ $t("Group details") }}</v-card-title> -->
          <v-toolbar flat>
            <v-toolbar-title>{{ group.name }}</v-toolbar-title>
            <v-spacer />

            <v-btn
              v-if="currentUserIsMember"
              :loading="leaving"
              @click="leaveGroup"
            >
              <v-icon start>mdi-location-exit</v-icon>
              {{ $t("Leave") }}
            </v-btn>
            <v-btn
              v-else
              :loading="joining"
              :disabled="group.restricted"
              @click="joinGroup"
            >
              <v-icon start>mdi-location-enter</v-icon>
              {{ $t("Join") }}
            </v-btn>
            <template v-if="currentUserHasAdminRights">
              <v-btn
                :disabled="!groupHasModifications"
                :loading="updating"
                @click="updateGroup"
              >
                <v-icon start>mdi-content-save</v-icon>
                {{ $t("Save") }}
              </v-btn>

              <DeleteGroupDialog />
            </template>
          </v-toolbar>
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field
                  :readonly="!currentUserHasAdminRights"
                  :label="$t('Group name')"
                  v-model="group.name"
                  hide-details
                />
              </v-col>
            </v-row>
            <v-row v-if="currentUserHasAdminRights">
              <v-col>
                <v-text-field
                  :label="$t('Group avatar URL')"
                  v-model="group.avatar_src"
                  hide-details
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  readonly
                  variant="filled"
                  label="ID"
                  v-model="group._id"
                  hide-details
                />
              </v-col>
            </v-row>
            <v-row justify="space-between">
              <v-col cols="auto">
                <v-switch
                  :disabled="!currentUserHasAdminRights"
                  v-model="group.restricted"
                  :label="$t('Restricted')"
                  hide-details
                />
              </v-col>
              <v-col cols="auto">
                <v-switch
                  :disabled="!currentUserHasAdminRights"
                  v-model="group.hidden"
                  :label="$t('Hidden')"
                  hide-details
                />
              </v-col>
              <v-col cols="auto">
                <v-switch
                  :disabled="!currentUser?.isAdmin"
                  v-model="group.official"
                  :label="$t('Official')"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Members -->
    <v-row>
      <v-col>
        <v-card variant="outlined">
          <v-toolbar flat>
            <v-toolbar-title>{{ $t("Related users") }}</v-toolbar-title>
            <template #extension>
              <v-tabs v-model="membersTab">
                <v-tab value="members">{{ $t("Members") }}</v-tab>
                <v-tab value="administrators">{{ $t("Administrators") }}</v-tab>
              </v-tabs>
            </template>
          </v-toolbar>
          <v-divider />
          <v-card-text>
            <v-window v-model="membersTab">
              <v-window-item
                v-for="userType in ['members', 'administrators']"
                :key="`user_type_${userType}`"
                :value="userType"
              >
                <UsersOfGroup
                  :currentUserHasAdminRights="currentUserHasAdminRights"
                  :user_type="userType"
                  @usersChanged="getGroup"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Related groups -->
    <v-row>
      <v-col>
        <v-card variant="outlined">
          <v-toolbar flat>
            <v-toolbar-title>{{ $t("Related groups") }}</v-toolbar-title>
            <template #extension>
              <v-tabs v-model="groupsTab">
                <v-tab value="child">{{ $t("Subgroups") }}</v-tab>
                <v-tab value="parent">{{ $t("Parent groups") }}</v-tab>
              </v-tabs>
            </template>
          </v-toolbar>
          <v-divider />
          <v-card-text>
            <v-window v-model="groupsTab">
              <v-window-item
                v-for="groupType in ['child', 'parent']"
                :key="`group_type_${groupType}`"
                :value="groupType"
              >
                <GroupsOfGroups
                  :group_type="groupType"
                  :currentUserHasAdminRights="currentUserHasAdminRights"
                  @groupsChanged="getGroup"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </template>

  <v-row v-else-if="error" justify="center">
    <v-col cols="auto">
      {{ error }}
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import DeleteGroupDialog from "@/components/DeleteGroupDialog.vue";
import GroupsOfGroups from "@/components/GroupsOfGroups.vue";
import UsersOfGroup from "@/components/UsersOfGroup.vue";
import api from "@/api";

const route = useRoute();
const { currentUser, currentUserId } = useAuth();

const group = ref<any>(null);
const unmodifiedGroupCopy = ref<any>(null);
const members = ref<any[]>([]);
const administrators = ref<any[]>([]);

const membersTab = ref("members");
const groupsTab = ref("child");

const loading = ref(false);
const updating = ref(false);
const joining = ref(false);
const leaving = ref(false);
const error = ref<string | null>(null);

const groupId = computed(() => route.params.group_id as string);

function matchesCurrentUser(entity: any) {
  const id = currentUserId.value;
  if (!id) return false;
  return entity._id === id || entity.username === id;
}

const currentUserIsMember = computed(() =>
  members.value.some(matchesCurrentUser),
);
const currentUserIsAdministrator = computed(() =>
  administrators.value.some(matchesCurrentUser),
);
const currentUserHasAdminRights = computed(
  () => currentUserIsAdministrator.value || !!currentUser.value?.isAdmin,
);

const modifiedProperties = computed(() => {
  if (!group.value || !unmodifiedGroupCopy.value) return {};
  return Object.keys(group.value).reduce((acc: any, key) => {
    const current = group.value[key];
    const original = unmodifiedGroupCopy.value[key];
    if (current != null && typeof current === "object") return acc;
    if (original !== current) acc[key] = current;
    return acc;
  }, {});
});

const groupHasModifications = computed(
  () => Object.keys(modifiedProperties.value).length > 0,
);

async function getMembers() {
  try {
    const { data } = await api.get(`/v3/groups/${groupId.value}/members`);
    members.value = data.items;
  } catch (err) {
    console.error(err);
  }
}

async function getAdministrators() {
  try {
    const { data } = await api.get(
      `/v3/groups/${groupId.value}/administrators`,
    );
    administrators.value = data.items;
  } catch (err) {
    console.error(err);
  }
}

async function getGroup() {
  group.value = null;
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get(`/v3/groups/${groupId.value}`);
    group.value = data;
    unmodifiedGroupCopy.value = JSON.parse(JSON.stringify(data));
    getMembers();
    getAdministrators();
  } catch (err: any) {
    console.error(err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function updateGroup() {
  updating.value = true;
  try {
    await api.patch(`/v3/groups/${groupId.value}`, modifiedProperties.value);
    getGroup();
  } catch (err) {
    console.error(err);
  } finally {
    updating.value = false;
  }
}

async function joinGroup() {
  joining.value = true;
  try {
    await api.post(`/v3/groups/${groupId.value}/members`, { user_id: "self" });
    getGroup();
  } catch (err) {
    alert("Failed to join group");
    console.error(err);
  } finally {
    joining.value = false;
  }
}

async function leaveGroup() {
  leaving.value = true;
  try {
    await api.delete(`/v3/groups/${groupId.value}/members/self`);
    getGroup();
  } catch (err) {
    console.error(err);
  } finally {
    leaving.value = false;
  }
}

watch(groupId, getGroup);
onMounted(getGroup);
</script>
