<template>
  <v-dialog width="50vw" v-model="dialog">
    <template #activator="{ props }">
      <v-btn v-bind="props">
        <v-icon start>mdi-delete</v-icon>
        {{ $t("Delete") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title>{{ $t("Delete group") }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-spacer />
          <v-col cols="auto">
            <v-switch v-model="deep" :label="$t('Also delete subgroups')" />
          </v-col>
          <v-spacer />
        </v-row>
      </v-card-text>
      <v-card-text>
        <v-row>
          <v-spacer />
          <v-col cols="auto">
            <v-btn @click="dialog = false">
              <v-icon start>mdi-close</v-icon>
              {{ $t("Cancel") }}
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" @click="deleteGroup">
              <v-icon start>mdi-account-multiple-remove</v-icon>
              {{ $t("Delete") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api";

const route = useRoute();
const router = useRouter();

const dialog = ref(false);
const deep = ref(false);

const groupId = computed(() => route.params.group_id as string);

async function deleteGroup() {
  try {
    await api.delete(`/v3/groups/${groupId.value}`, {
      params: { deep: deep.value },
    });
    router.push({ name: "UserGroups", params: { user_id: "self" } });
  } catch (error) {
    console.error(error);
  }
}
</script>
