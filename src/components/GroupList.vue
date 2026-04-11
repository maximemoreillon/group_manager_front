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
    <template #item.image="{ item }">
      <v-img v-if="item.avatar_src" contain width="2.5em" height="2.5em" :src="item.avatar_src" />
      <v-icon size="2.5em" v-else>mdi-account-multiple</v-icon>
    </template>

    <template #item.name="{ item }">
      <span class="text-primary cursor-pointer" @click="$emit('selection', item)">{{ item.name }}</span>
    </template>

    <template #item.restricted="{ item }">
      <v-icon v-if="item.restricted">mdi-lock</v-icon>
    </template>

    <template #item.official="{ item }">
      <v-icon v-if="item.official">mdi-check</v-icon>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '@/api'

defineEmits<{ selection: [group: any] }>()

const loading = ref(false)
const groups = ref<any[]>([])
const total = ref(0)
const itemsPerPageOptions = [50, 100, 500, -1]

const headers = [
  { key: 'image', title: '', width: '50px', sortable: false },
  { key: 'name', title: 'Name', sortable: false },
  { key: 'official', title: 'Official', sortable: false },
  { key: 'restricted', title: 'Restricted', sortable: false },
]

async function loadGroups({ page, itemsPerPage }: { page: number; itemsPerPage: number }) {
  loading.value = true
  groups.value = []
  try {
    const { data } = await api.get('/v3/groups', {
      params: {
        batch_size: itemsPerPage,
        start_index: (page - 1) * itemsPerPage,
      },
    })
    total.value = data.count
    groups.value = data.items
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
