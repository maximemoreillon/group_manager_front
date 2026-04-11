<template>
  <v-btn :loading="loading" @click="excelExport">
    <v-icon start>mdi-file-excel</v-icon>
    {{ $t('Excel export') }}
  </v-btn>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { utils, writeFile } from 'xlsx'
import api from '@/api'

const props = defineProps<{ user_type: string }>()
const route = useRoute()

const loading = ref(false)
const groupId = computed(() => route.params.group_id as string)

async function excelExport() {
  loading.value = true
  try {
    const { data: { items } } = await api.get(`/v3/groups/${groupId.value}/${props.user_type}`, {
      params: { batch_size: -1 },
    })
    const workbook = utils.book_new()
    const ws = utils.json_to_sheet(items)
    utils.book_append_sheet(workbook, ws, 'Sheet1')
    writeFile(workbook, `group_${groupId.value}_${props.user_type}_export.xlsx`)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
