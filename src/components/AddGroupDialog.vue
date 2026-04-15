<template>
  <v-dialog v-model="dialog" width="70vw">
    <template #activator="{ props }">
      <v-btn color="primary" v-bind="props">
        <v-icon start>mdi-account-multiple-plus</v-icon>
        {{ dialogTitle }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title>{{ dialogTitle }}</v-card-title>
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
import { ref, computed } from "vue";
import {
  GroupPicker,
  type GroupItem,
} from "@moreillon/group-manager-vue-picker";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/composables/useAuth";

const props = defineProps<{ as?: string }>();
const emit = defineEmits<{ groupAdd: [group: GroupItem] }>();

const { t } = useI18n();
const { accessToken } = useAuth();
const dialog = ref(false);
const groupManagerApiUrl = import.meta.env.VITE_GROUP_MANAGER_API_URL;

const dialogTitle = computed(() => {
  if (props.as === "child") return t("Add child group");
  if (props.as === "parent") return t("Add parent group");
  return t("Add group");
});

function groupSelected(group: GroupItem) {
  emit("groupAdd", group);
  dialog.value = false;
}
</script>
