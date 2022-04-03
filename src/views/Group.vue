<template>
  <v-card
    class="mx-auto"
    max-width="60em"
    :loading="loading">

    <template v-if="group">


      <v-toolbar flat>
        <v-row align="center">
          <v-col cols="auto">
            <v-btn
              exact
              icon
              :to="{name: 'Groups'}" >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-toolbar-title>{{group.name}}</v-toolbar-title>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-btn
              :loading="leaving"
              v-if="current_user_is_member_of_group"
              @click="leave_group()">
              <v-icon>mdi-account-multiple-minus</v-icon>
              <span class="ml-2">Leave</span>
            </v-btn>
            <v-btn
              v-else
              :loading="joining"
              :disabled="group.restricted"
              @click="join_group()">
              <v-icon>mdi-account-multiple-plus</v-icon>
              <span class="ml-2">Join</span>
            </v-btn>
          </v-col>
          <template
            v-if="current_user_is_administrator_of_group || current_user.isAdmin">
            <v-col cols="auto">
              <v-btn
                :disabled="!group_has_modifications"
                :loading="updating"
                @click="update_group()">
                <v-icon>mdi-content-save</v-icon>
                <span class="ml-2">Save</span>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn
                :loading="deleting"
                @click="delete_group()"
                color="#c00000"
                dark>
                <v-icon>mdi-delete</v-icon>
                <span class="ml-2">Delete</span>
              </v-btn>
            </v-col>



          </template>
        </v-row>

      </v-toolbar>
      <v-divider/>



      <!-- Group metadata -->
      <!-- Would probably be better as component -->
      <v-card-text>
        <v-card outlined>
          <v-card-title>Group details</v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                cols="5"
                align-self="center">
                <v-img
                  v-if="group.avatar_src"
                  :src="group.avatar_src"
                  contain
                  height="15em"/>

                <div
                  v-else
                  class="text-center">
                  <v-icon
                    size="15em">
                    mdi-account-multiple
                  </v-icon>
                </div>

              </v-col>

              <v-col cols="7">
                <!-- Would have been better as rows and cols -->
                <v-row>
                  <v-col>
                    <v-text-field
                      :readonly="!current_user_is_administrator_of_group"
                      label="Name"
                      v-model="group.name" />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      readonly
                      filled
                      label="ID"
                      v-model="group._id" />
                  </v-col>
                </v-row>

                <v-row v-if="current_user_is_administrator_of_group">
                  <v-col>
                    <v-text-field
                      label="Avatar URL"
                      v-model="group.avatar_src" />
                  </v-col>
                </v-row>

                <v-row v-if="current_user_is_administrator_of_group">
                  <v-col>
                    <v-switch
                      v-model="group.restricted"
                      label="Restricted"/>
                  </v-col>

                  <v-col v-if="current_user.isAdmin">
                    <v-switch
                      v-model="group.official"
                      label="Official"/>
                  </v-col>
                </v-row>

              </v-col>
            </v-row>
          </v-card-text>
        </v-card>


      </v-card-text>

      <!-- Members -->
      <v-card-text>
        <v-card outlined>
          <v-toolbar flat>
            <v-toolbar-title>Related users</v-toolbar-title>
            <template v-slot:extension>
              <v-tabs
                v-model="members_tab">
                <v-tab>Members</v-tab>
                <v-tab>Administrators</v-tab>
              </v-tabs>
            </template>

          </v-toolbar>
          <v-divider/>
          <v-card-text>
            <v-tabs-items v-model="members_tab">
              <v-tab-item>
                <UsersOfGroup
                  :currentUserHasAdminRights="current_user_has_admin_rights"
                  user_type="members"
                  @usersChanged="get_group()"/>
              </v-tab-item>
              <v-tab-item>
                <UsersOfGroup
                  :currentUserHasAdminRights="current_user_has_admin_rights"
                  user_type="administrators"
                  @usersChanged="get_group()"/>
              </v-tab-item>
            </v-tabs-items>

          </v-card-text>
        </v-card>
      </v-card-text>

      <!-- Related groups -->
      <v-card-text>
        <v-card outlined>
          <v-toolbar flat>
            <v-toolbar-title>Related groups</v-toolbar-title>
            <template v-slot:extension>
              <v-tabs
                v-model="groups_tab">
                <v-tab>Subgroups</v-tab>
                <v-tab>Parent groups</v-tab>
              </v-tabs>
            </template>

          </v-toolbar>
          <v-divider/>
          <v-card-text>
            <v-tabs-items v-model="groups_tab">
              <v-tab-item>
                <GroupsOfGroups
                  group_type="child"
                  :currentUserHasAdminRights="current_user_has_admin_rights"
                  @groupsChanged="get_group()"/>
              </v-tab-item>
              <v-tab-item>
                <GroupsOfGroups
                  group_type="parent"
                  :currentUserHasAdminRights="current_user_has_admin_rights"
                  @groupsChanged="get_group()"/>
              </v-tab-item>
            </v-tabs-items>

          </v-card-text>
        </v-card>
      </v-card-text>





    </template>

    <v-card-text class="text-center pa-5" v-if="loading">Loading group...</v-card-text>
    <v-card-text class="text-center pa-5 error--text" v-if="error">{{error}}</v-card-text>

  </v-card>
</template>

<script>
// @ is an alias to /src
import GroupsOfGroups from '@/components/GroupsOfGroups.vue'
import UsersOfGroup from '@/components/UsersOfGroup.vue'

export default {
  name: 'Group',
  components: {
    UsersOfGroup,
    GroupsOfGroups,
  },
  data(){
    return {
      group: null,
      unmodified_group_copy: null,

      members_tab: null,
      groups_tab: null,

      // Used to check if user is member of admin
      // NOT IDEAL
      members: [],
      administrators: [],

      // Used for loaders
      loading: false,
      updating: false,
      deleting: false,
      joining: false,
      leaving: false,

      error: null,


    }
  },
  mounted(){
    this.get_group()
  },
  watch:{
    group_id(){
      this.get_group()
    }
  },
  methods: {
    get_group(){
      this.group = null
      this.loading = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}`
      this.axios.get(url)
      .then( ({data}) => {
        this.group = data

        this.get_members()
        this.get_administrators()

        this.save_copy_of_group()
      })
      .catch( error => {
        console.error(error)
        this.error = error
      })
      .finally(() => {
        this.loading = false
      })
    },



    delete_group(){
      if(!confirm(`Delete group ${this.group.name}?`)) return
      this.deleting = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}`
      this.axios.delete(url)
      .then( () => {
        this.$router.push({name: 'UserGroups'})
      })
      .catch( error => {
        console.error(error)
      })
      .finally(() => {
        this.deleting = false
      })
    },


    update_group(){
      this.updating = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}`
      const body = this.modified_properties
      this.axios.patch(url, body)
      .then( () => {
        this.get_group()
      })
      .catch( error => {
        console.error(error)
      })
      .finally(() => {
        this.updating = false
      })
    },

    join_group(){
      this.joining = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/join`
      this.axios.post(url)
      .then( () => {
        this.get_group()
      })
      .catch( error => {
        console.error(error)
      })
      .finally(() => {
        this.joining = false
      })
    },

    leave_group(){
      this.leaving = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/leave`
      this.axios.post(url)
      .then( () => {
        this.get_group()
      })
      .catch( error => {
        console.error(error)
      })
      .finally(() => {
        this.leaving = false
      })
    },

    get_members(){
      // Currently not related to the members table
      // Simply used to check if user is member
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/members`
      this.axios.get(url)
      .then( ({data}) => { this.members = data.items })
      .catch( error => {
        console.error(error)
      })
    },

    get_administrators(){
      // Currently not related to the administrators table
      // Simply used to check if user is administrator
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/administrators`
      this.axios.get(url)
      .then( ({data}) => { this.administrators = data.items })
      .catch( error => {
        console.error(error)
      })
    },
    save_copy_of_group(){
      this.unmodified_group_copy = JSON.parse(JSON.stringify(this.group))
    },





  },
  computed: {
    group_id(){
      return this.$route.params.group_id
    },
    current_user(){
      return this.$store.state.current_user
    },
    current_user_id(){
      if(!this.current_user) return undefined
      return this.current_user._id
        || this.current_user.properties._id
    },
    current_user_is_member_of_group(){
      return this.members.some( ({_id}) => _id === this.current_user_id)
    },
    current_user_is_administrator_of_group(){
      return this.administrators.some( ({_id}) => _id === this.current_user_id)
    },
    current_user_has_admin_rights(){
      return this.current_user_is_administrator_of_group || this.current_user.isAdmin
    },
    modified_properties(){
      if(!this.group) return {}
      if(!this.unmodified_group_copy) return {}

      const current_keys = Object.keys(this.group)

      return current_keys.reduce( (acc, key) => {

        const current_value = this.group[key]
        const original_value = this.unmodified_group_copy[key]

        // Only deal with non-nested stuff
        if(current_value != null && typeof current_value === 'object') return acc

        // If there is a modification, add it to an object of modified properties
        if(original_value !== current_value)   acc[key] = current_value

        return acc
      }, {})
    },
    group_has_modifications(){
      return Object.keys(this.modified_properties).length > 0
    }


  }
}
</script>
