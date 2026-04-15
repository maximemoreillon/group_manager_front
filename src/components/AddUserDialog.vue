<template>
  <v-dialog width="90vw" v-model="dialog">
    <template #activator="{ props }">
      <v-btn color="primary" v-bind="props">
        <v-icon start>mdi-account-plus</v-icon>
        {{ dialogTitle }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title>{{ dialogTitle }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <UserPicker
              :groupManagerApiUrl="groupManagerApiUrl"
              :accessToken="accessToken"
              @selection="addUser"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card variant="outlined" min-height="10vh">
              <v-card-title>{{ $t("Selected users") }}</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    cols="auto"
                    v-for="(user, index) in selectedUsers"
                    :key="user._id"
                  >
                    <v-chip closable @click:close="removeUser(index)">
                      {{ user.display_name || user.username }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">{{ $t("Cancel") }}</v-btn>
        <v-btn color="primary" @click="addSelectedUsers">{{
          $t("Add selected users")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { UserPicker, type User } from "@moreillon/group-manager-vue-picker";
import { useAuth } from "@/composables/useAuth";
import api from "@/api";

const props = defineProps<{ as?: string }>();
const emit = defineEmits<{ usersChanged: [] }>();

const { t } = useI18n();

const dialogTitle = computed(() => {
  if (props.as === "members") return t("Add members");
  if (props.as === "administrators") return t("Add administrators");
  return t("Add user");
});
const route = useRoute();
const { accessToken } = useAuth();
const dialog = ref(false);
const selectedUsers = ref<User[]>([]);
const groupManagerApiUrl = import.meta.env.VITE_GROUP_MANAGER_API_URL;
const snackbar = ref({ show: false, message: "", color: "" });

const groupId = ref(route.params.group_id as string);

watch(dialog, (open) => {
  if (!open) selectedUsers.value = [];
});

function addUser(user: User) {
  if (selectedUsers.value.some(({ _id }) => _id === user._id)) {
    snackbar.value = {
      show: true,
      message: t("User already added"),
      color: "warning",
    };
    return;
  }
  selectedUsers.value.push(user);
}

function removeUser(index: number) {
  selectedUsers.value.splice(index, 1);
}

async function addSelectedUsers() {
  try {
    await api.post(`/v3/groups/${groupId.value}/${props.as}`, {
      user_ids: selectedUsers.value.map(({ _id }) => _id),
    });
    emit("usersChanged");
    dialog.value = false;
  } catch (error) {
    console.error(error);
  }
}
</script>
