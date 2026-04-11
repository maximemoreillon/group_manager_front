<template>
  <v-dialog v-model="dialog" width="70vw">
    <template #activator="{ props }">
      <v-btn color="primary" v-bind="props">
        <v-icon start>mdi-account-multiple-plus</v-icon>
        Add {{ as || 'group' }} group
      </v-btn>
    </template>
    <v-card>
      <v-card-title>Add {{ as || 'group' }} group</v-card-title>
      <v-card-text>
        <GroupList @selection="groupSelected" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="primary" @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GroupList from '@/components/GroupList.vue'

defineProps<{ as?: string }>()
const emit = defineEmits<{ groupAdd: [group: { _id: string }] }>()

const dialog = ref(false)

function groupSelected(group: { _id: string }) {
  emit('groupAdd', { _id: group._id })
  dialog.value = false
}
</script>
