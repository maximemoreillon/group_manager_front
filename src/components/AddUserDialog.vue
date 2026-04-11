<template>
  <v-dialog width="90vw" v-model="dialog">
    <template #activator="{ props }">
      <v-btn color="primary" v-bind="props">
        <v-icon start>mdi-account-plus</v-icon>
        Add {{ as || 'user' }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title>Add {{ as || 'user' }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="searchUsers">
          <v-row align="center" dense>
            <v-col>
              <v-text-field v-model="search" label="Search users" hide-details />
            </v-col>
            <v-col cols="auto">
              <v-btn type="submit" icon :loading="searching">
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <v-list v-if="searchResults.length">
          <v-list-item
            v-for="user in searchResults"
            :key="user._id"
            :title="user.display_name || user.username"
            @click="addUser(user)"
          />
        </v-list>
      </v-card-text>
      <v-card-text>
        <v-card variant="outlined" min-height="10vh">
          <v-card-title>Selected users</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="auto" v-for="(user, index) in selectedUsers" :key="user._id">
                <v-chip closable @click:close="removeUser(index)">
                  {{ user.display_name || user.username }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="addSelectedUsers">Add selected users</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const props = defineProps<{ as?: string }>()
const emit = defineEmits<{ usersChanged: [] }>()

const route = useRoute()
const dialog = ref(false)
const search = ref('')
const searching = ref(false)
const searchResults = ref<any[]>([])
const selectedUsers = ref<any[]>([])

const groupId = computed(() => route.params.group_id as string)

watch(dialog, (open) => {
  if (!open) {
    selectedUsers.value = []
    searchResults.value = []
    search.value = ''
  }
})

async function searchUsers() {
  searching.value = true
  try {
    const { data } = await api.get('/v3/users', { params: { search: search.value } })
    searchResults.value = data.items ?? data
  } catch (error) {
    console.error(error)
  } finally {
    searching.value = false
  }
}

function addUser(user: any) {
  if (selectedUsers.value.some(({ _id }) => _id === user._id)) return alert('Duplicates not allowed')
  selectedUsers.value.push(user)
}

function removeUser(index: number) {
  selectedUsers.value.splice(index, 1)
}

async function addSelectedUsers() {
  try {
    await api.post(`/v3/groups/${groupId.value}/${props.as}`, {
      user_ids: selectedUsers.value.map(({ _id }) => _id),
    })
    emit('usersChanged')
    dialog.value = false
  } catch (error) {
    console.error(error)
  }
}
</script>
