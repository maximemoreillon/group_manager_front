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
          <GroupList @selection="groupSelected" />
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
import GroupList from '@/components/GroupList.vue'
import GroupSearch from '@/components/GroupSearch.vue'

const router = useRouter()
const tab = ref('browse')

function groupSelected(group: { _id: string }) {
  router.push({ name: 'Group', params: { group_id: group._id } })
}
</script>
