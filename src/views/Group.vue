<template>

  <v-card>

    <v-toolbar flat>
      <v-btn
        exact
        icon
        :to="{name: 'Groups'}" >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title v-if="group">{{group.name}}</v-toolbar-title>
      <v-toolbar-title v-else>Group</v-toolbar-title>
      <v-spacer />
      <v-btn
        :disabled="!group_has_modifications"
        class="mx-2"
        @click="update_group()">
        <v-icon>mdi-content-save</v-icon>
        <span>Save</span>
      </v-btn>

      <v-btn
        class="mx-2"
        @click="delete_group()"
        color="#c00000"
        dark>
        <v-icon>mdi-delete</v-icon>
        <span>Delete</span>
      </v-btn>



    </v-toolbar>
    <v-divider/>


    <template v-if="group">

      <v-card-text>
        <v-row>
          <v-col cols="5">
            <v-img
              src="@/assets/logo.png"
              contain
              height="15em"/>
          </v-col>
          <v-col cols="7">
            <v-list two-line>
              <v-list-item>
                <v-list-item-content>
                  <v-text-field
                    :radonly="!current_user_is_administrator_of_group || current_user.isAdmin"
                    label="Group name"
                    v-model="group.name" />
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle>Group ID</v-list-item-subtitle>
                  <v-list-item-title>{{group._id}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <template v-if="current_user_is_administrator_of_group">
                <v-list-item>
                  <v-list-item-content>
                    <v-switch
                    v-model="group.restricted"
                    label="Restricted"/>
                  </v-list-item-content>
                </v-list-item>
              </template>

              <template v-if="current_user.isAdmin">
                <v-list-item>
                  <v-list-item-content>
                    <v-switch
                      v-model="group.official"
                      label="Official"/>
                  </v-list-item-content>
                </v-list-item>
              </template>

            </v-list>





          </v-col>
        </v-row>

      </v-card-text>

      <v-card-text>
        <Members
          user_type="members"
          @usersChanged="get_group()"/>
      </v-card-text>

      <v-card-text>
        <Members
          user_type="administrators"
          @usersChanged="get_group()"/>
      </v-card-text>

      <v-card-text>
        <SubGroups
          @groupsChanged="get_group()"/>
      </v-card-text>

      <v-card-text>
        <ParentGroups
          @groupsChanged="get_group()"/>
      </v-card-text>


    </template>

  </v-card>
</template>

<script>
// @ is an alias to /src
import SubGroups from '@/components/SubGroups.vue'
import ParentGroups from '@/components/ParentGroups.vue'
import Members from '@/components/Members.vue'

export default {
  name: 'Group',
  components: {
    SubGroups,
    ParentGroups,
    Members,
  },
  data(){
    return {
      group: null,
      loading: false,
      members_table_headers: [
        {text: 'ID', value: 'user_id'},
        {text: 'Username', value: 'username'},
        {text: 'Admin', value: 'admin'},
        {text: 'Delete', value: 'delete'},
      ],
      subgroups_table_headers: [
        {text: 'ID', value: '_id'},
      ],

      // here or in dedicated component?
      administrators: [],
      members: [],

      unmodified_group_copy: null,

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
      })
      .finally(() => {
        this.loading = false
      })
    },

    get_parent(){
      if(!this.group.parent) return
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group.parent}`
      this.axios.get(url)
      .then( ({data}) => {
        this.$set(this.group,'parent',data)
      })
      .catch( error => {
        console.error(error)
      })
    },

    delete_group(){
      if(!confirm(`Delete group ${this.group.name}?`)) return
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}`
      this.axios.delete(url)
      .then( () => {
        this.$router.push({name: 'UserGroups'})
      })
      .catch( error => {
        console.error(error)
      })
    },


    update_group(){
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}`
      const body = this.modified_properties
      this.axios.patch(url, body)
      .then( () => {
        this.get_group()
      })
      .catch( error => {
        console.error(error)
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
