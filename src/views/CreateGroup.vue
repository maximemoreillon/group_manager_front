<template>
  <v-card max-width="60em" class="mx-auto">
    <v-toolbar flat>
      <v-btn icon exact :to="{ name: 'Groups' }">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t('Create group') }}</v-toolbar-title>
    </v-toolbar>
    <v-divider />
    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="createGroup">
        <v-row align="center">
          <v-col>
            <v-text-field v-model="group.name" label="Name" :rules="nameRules" required />
          </v-col>
          <v-col cols="auto">
            <v-btn type="submit" :disabled="!valid" :loading="creating" color="primary">
              <v-icon start>mdi-account-multiple-plus</v-icon>
              {{ $t('Create') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api'

const router = useRouter()
const route = useRoute()

const form = ref()
const valid = ref(false)
const creating = ref(false)
const group = ref({ name: '' })
const nameRules = [(v: string) => !!v || 'Name is required']

async function createGroup() {
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return
  creating.value = true
  try {
    const parent = route.query.parent as string | undefined
    const { data } = await api.post('/v3/groups', { ...group.value, parent })
    router.push({ name: 'Group', params: { group_id: data._id } })
  } catch (error: any) {
    console.error(error)
  } finally {
    creating.value = false
  }
}
</script>
