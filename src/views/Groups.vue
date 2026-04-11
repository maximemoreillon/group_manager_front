<template>
  <v-card max-width="60em" class="mx-auto">
    <v-toolbar flat>
      <v-toolbar-title>{{ $t('Groups') }}</v-toolbar-title>
      <v-spacer />
      <v-btn exact :to="{ name: 'CreateGroup' }" color="primary">
        <v-icon start>mdi-account-multiple-plus</v-icon>
        {{ $t('Create group') }}
      </v-btn>
      <template #extension>
        <v-tabs v-model="tab">
          <v-tab value="browse">{{ $t('Browse') }}</v-tab>
          <v-tab value="search">{{ $t('Search') }}</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <v-divider />
    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="browse">
          <GroupPicker
            :groupManagerApiUrl="groupManagerApiUrl"
            :accessToken="accessToken"
            @selection="groupSelected"
          />
        </v-window-item>
        <v-window-item value="search">
          <v-card variant="outlined">
            <v-card-text>
              <GroupSearch @selection="groupSelected" />
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GroupPicker, type GroupItem } from '@moreillon/group-manager-vue-picker'
import { useAuth } from '@/composables/useAuth'
import GroupSearch from '@/components/GroupSearch.vue'

const router = useRouter()
const { accessToken } = useAuth()
const tab = ref('browse')
const groupManagerApiUrl = import.meta.env.VITE_GROUP_MANAGER_API_URL

function groupSelected(group: GroupItem) {
  router.push({ name: 'Group', params: { group_id: group._id } })
}
</script>
