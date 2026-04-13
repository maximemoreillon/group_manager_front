<template>
  <v-dialog v-model="dialog" width="70vw">
    <template #activator="{ props }">
      <v-btn color="primary" v-bind="props">
        <v-icon start>mdi-account-multiple-plus</v-icon>
        Add {{ as || "group" }} group
      </v-btn>
    </template>
    <v-card>
      <v-card-title>Add {{ as || "group" }} group</v-card-title>
      <v-card-text>
        <GroupPicker
          :groupManagerApiUrl="groupManagerApiUrl"
          :accessToken="accessToken"
          @selection="groupSelected"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="primary" @click="dialog = false">{{
          $t("Close")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  GroupPicker,
  type GroupItem,
} from "@moreillon/group-manager-vue-picker";
import { useAuth } from "@/composables/useAuth";

defineProps<{ as?: string }>();
const emit = defineEmits<{ groupAdd: [group: GroupItem] }>();

const { accessToken } = useAuth();
const dialog = ref(false);
const groupManagerApiUrl = import.meta.env.VITE_GROUP_MANAGER_API_URL;

function groupSelected(group: GroupItem) {
  emit("groupAdd", group);
  dialog.value = false;
}
</script>

<style>
.user_picker,
.group_picker {
  max-height: 50vh;
}
</style>
