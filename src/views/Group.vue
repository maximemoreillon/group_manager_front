<template>
  <v-card class="mx-auto" max-width="60em" :loading="loading">
    <template v-if="group">
      <v-toolbar flat>
        <v-row align="center">
          <v-col cols="auto">
            <v-btn icon exact :to="{ name: 'Groups' }">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-toolbar-title>{{ group.name }}</v-toolbar-title>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-btn v-if="currentUserIsMember" :loading="leaving" @click="leaveGroup">
              <v-icon start>mdi-location-exit</v-icon>
              {{ $t('Leave') }}
            </v-btn>
            <v-btn v-else :loading="joining" :disabled="group.restricted" @click="joinGroup">
              <v-icon start>mdi-location-enter</v-icon>
              {{ $t('Join') }}
            </v-btn>
          </v-col>
          <template v-if="currentUserHasAdminRights">
            <v-col cols="auto">
              <v-btn :disabled="!groupHasModifications" :loading="updating" @click="updateGroup">
                <v-icon start>mdi-content-save</v-icon>
                {{ $t('Save') }}
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <DeleteGroupDialog />
            </v-col>
          </template>
        </v-row>
      </v-toolbar>
      <v-divider />

      <!-- Group metadata -->
      <v-card-text>
        <v-card variant="outlined">
          <v-card-title>{{ $t('Group details') }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="5" align-self="center">
                <v-img v-if="group.avatar_src" :src="group.avatar_src" contain height="15em" />
                <div v-else class="text-center">
                  <v-icon size="15em">mdi-account-multiple</v-icon>
                </div>
              </v-col>
              <v-col cols="7">
                <v-row>
                  <v-col>
                    <v-text-field
                      :readonly="!currentUserHasAdminRights"
                      :label="$t('Group name')"
                      v-model="group.name"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field readonly variant="filled" label="ID" v-model="group._id" />
                  </v-col>
                </v-row>
                <v-row v-if="currentUserHasAdminRights">
                  <v-col>
                    <v-text-field :label="$t('Group avatar URL')" v-model="group.avatar_src" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-switch
                      :disabled="!currentUserHasAdminRights"
                      v-model="group.restricted"
                      :label="$t('Restricted')"
                    />
                  </v-col>
                  <v-col>
                    <v-switch
                      :disabled="!currentUser?.isAdmin"
                      v-model="group.official"
                      :label="$t('Official')"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Members -->
      <v-card-text>
        <v-card variant="outlined">
          <v-toolbar flat>
            <v-toolbar-title>{{ $t('Related users') }}</v-toolbar-title>
            <template #extension>
              <v-tabs v-model="membersTab">
                <v-tab value="members">{{ $t('Members') }}</v-tab>
                <v-tab value="administrators">{{ $t('Administrators') }}</v-tab>
              </v-tabs>
            </template>
          </v-toolbar>
          <v-divider />
          <v-card-text>
            <v-window v-model="membersTab">
              <v-window-item
                v-for="userType in ['members', 'administrators']"
                :key="`user_type_${userType}`"
                :value="userType"
              >
                <UsersOfGroup
                  :currentUserHasAdminRights="currentUserHasAdminRights"
                  :user_type="userType"
                  @usersChanged="getGroup"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Related groups -->
      <v-card-text>
        <v-card variant="outlined">
          <v-toolbar flat>
            <v-toolbar-title>{{ $t('Related groups') }}</v-toolbar-title>
            <template #extension>
              <v-tabs v-model="groupsTab">
                <v-tab value="child">{{ $t('Subgroups') }}</v-tab>
                <v-tab value="parent">{{ $t('Parent groups') }}</v-tab>
              </v-tabs>
            </template>
          </v-toolbar>
          <v-divider />
          <v-card-text>
            <v-window v-model="groupsTab">
              <v-window-item
                v-for="groupType in ['child', 'parent']"
                :key="`group_type_${groupType}`"
                :value="groupType"
              >
                <GroupsOfGroups
                  :group_type="groupType"
                  :currentUserHasAdminRights="currentUserHasAdminRights"
                  @groupsChanged="getGroup"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-card-text>
    </template>

    <v-card-text v-if="loading" class="text-center pa-5">Loading group...</v-card-text>
    <v-card-text v-if="error" class="text-center pa-5 text-error">{{ error }}</v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import DeleteGroupDialog from '@/components/DeleteGroupDialog.vue'
import GroupsOfGroups from '@/components/GroupsOfGroups.vue'
import UsersOfGroup from '@/components/UsersOfGroup.vue'
import api from '@/api'

const route = useRoute()
const { currentUser, currentUserId } = useAuth()

const group = ref<any>(null)
const unmodifiedGroupCopy = ref<any>(null)
const members = ref<any[]>([])
const administrators = ref<any[]>([])

const membersTab = ref('members')
const groupsTab = ref('child')

const loading = ref(false)
const updating = ref(false)
const joining = ref(false)
const leaving = ref(false)
const error = ref<string | null>(null)

const groupId = computed(() => route.params.group_id as string)

function matchesCurrentUser(entity: any) {
  const id = currentUserId.value
  if (!id) return false
  return entity._id === id || entity.username === id
}

const currentUserIsMember = computed(() => members.value.some(matchesCurrentUser))
const currentUserIsAdministrator = computed(() => administrators.value.some(matchesCurrentUser))
const currentUserHasAdminRights = computed(
  () => currentUserIsAdministrator.value || !!currentUser.value?.isAdmin
)

const modifiedProperties = computed(() => {
  if (!group.value || !unmodifiedGroupCopy.value) return {}
  return Object.keys(group.value).reduce((acc: any, key) => {
    const current = group.value[key]
    const original = unmodifiedGroupCopy.value[key]
    if (current != null && typeof current === 'object') return acc
    if (original !== current) acc[key] = current
    return acc
  }, {})
})

const groupHasModifications = computed(() => Object.keys(modifiedProperties.value).length > 0)

async function getMembers() {
  try {
    const { data } = await api.get(`/v3/groups/${groupId.value}/members`)
    members.value = data.items
  } catch (err) {
    console.error(err)
  }
}

async function getAdministrators() {
  try {
    const { data } = await api.get(`/v3/groups/${groupId.value}/administrators`)
    administrators.value = data.items
  } catch (err) {
    console.error(err)
  }
}

async function getGroup() {
  group.value = null
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get(`/v3/groups/${groupId.value}`)
    group.value = data
    unmodifiedGroupCopy.value = JSON.parse(JSON.stringify(data))
    getMembers()
    getAdministrators()
  } catch (err: any) {
    console.error(err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function updateGroup() {
  updating.value = true
  try {
    await api.patch(`/v3/groups/${groupId.value}`, modifiedProperties.value)
    getGroup()
  } catch (err) {
    console.error(err)
  } finally {
    updating.value = false
  }
}

async function joinGroup() {
  joining.value = true
  try {
    await api.post(`/v3/groups/${groupId.value}/members`, { user_id: 'self' })
    getGroup()
  } catch (err) {
    alert('Failed to join group')
    console.error(err)
  } finally {
    joining.value = false
  }
}

async function leaveGroup() {
  leaving.value = true
  try {
    await api.delete(`/v3/groups/${groupId.value}/members/self`)
    getGroup()
  } catch (err) {
    console.error(err)
  } finally {
    leaving.value = false
  }
}

watch(groupId, getGroup)
onMounted(getGroup)
</script>
