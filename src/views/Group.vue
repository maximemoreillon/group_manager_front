<template>
  <div class="group">
    <template v-if="group && !loading">



      <div class="group_header">
        <h1 class="">{{group.properties.name}}</h1>
        <button
          type="button"
          v-on:click="leave_group()"
          v-if="current_user_is_member_of_group">
          <font-awesome-icon icon="sign-out-alt" />
          <span>Leave</span>
        </button>

        <button
          type="button"
          v-on:click="join_group()"
          v-if="!current_user_is_member_of_group">
          <font-awesome-icon icon="sign-in-alt" />
          <span>Join</span>
        </button>
      </div>

      <div class="group_id">
        ID: {{group.identity}}
      </div>

      <div class="avatar_wrapper">
        <img
          class="avatar"
          v-bind:class="{avatar_clickable: current_user_is_admin_of_group}"
          v-bind:src="group_avatar_src">
      </div>


      <Members
        :group="group"
        :current_user_is_admin_of_group="current_user_is_admin_of_group"
        @user_is_member="current_user_is_member_of_group=true"/>

      <Administrators
        :group="group"
        @user_is_admin_of_group="current_user_is_admin_of_group=true"/>

      <SubGroups
        :group="group"
        :current_user_is_admin_of_group="current_user_is_admin_of_group"/>

      <ParentGroups
        :group="group"
        :current_user_is_admin_of_group="current_user_is_admin_of_group"/>

      <!-- Parent Groups -->






      <!-- Admin controls of the group -->
      <template
        v-if="current_user_is_admin_of_group || current_user_is_admin">

        <h2>Group options</h2>

        <table class="group_properties_table">
          <tr>
            <td>Group name</td>
            <td>
              <input type="text" v-model="group.properties.name">
            </td>
          </tr>
          <tr>
            <td>Avatar URL</td>
            <td>
              <input type="text" v-model="group.properties.avatar_src">
            </td>
          </tr>
          <tr>
            <td>Restricted</td>
            <td>
              <input
                type="checkbox"
                v-model="group.properties.restricted">
            </td>
          </tr>
          <!-- Only super admins can make a group official -->
          <tr v-if="current_user_is_admin">
            <td>Official</td>
            <td>
              <input
                type="checkbox"
                v-model="group.properties.official">
            </td>
          </tr>
          <tr>
            <td>Save modifications</td>
            <td>
              <button
                type="button"
                v-on:click="patch_group()">
                <font-awesome-icon icon="save"/>
                <span>Save</span>
              </button>
            </td>
          </tr>
          <tr>
            <td>Delete group</td>
            <td>
              <button
                type="button"
                v-on:click="delete_group()">
                <font-awesome-icon icon="trash"/>
                <span>Delete</span>
              </button>
            </td>
          </tr>

        </table>

      </template>

    </template>

    <div class="loader_wrapper" v-if="loading">
      <Loader message="Loading group..."/>
    </div>

  </div>
</template>

<script>

import Members from '@/components/Members.vue'
import Administrators from '@/components/Administrators.vue'
import SubGroups from '@/components/SubGroups.vue'
import ParentGroups from '@/components/ParentGroups.vue'

import Loader from '@moreillon/vue_loader'

// Icons
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlus,
  faUserPlus,
  faEdit,
  faSave,
  faSignInAlt,
  faSignOutAlt,
  faUserTie,
  faUserSlash,
  faTrash,
  faFileExport,

} from '@fortawesome/free-solid-svg-icons'

library.add(
  faPlus,
  faUserPlus,
  faEdit,
  faSave,
  faSignInAlt,
  faSignOutAlt,
  faUserTie,
  faUserSlash,
  faTrash,
  faFileExport,

)

export default {
  name: 'Group',
  components: {
    Loader,

    FontAwesomeIcon,

    Members,
    Administrators,
    SubGroups,
    ParentGroups,
  },
  data(){
    return {
      group: null,
      loading: false,

      current_user_is_admin_of_group: false,
      current_user_is_member_of_group: false,
    }
  },
  watch: {
    group_id(){
      this.get_group()
    }
  },
  mounted(){
    this.get_group()
  },
  methods: {

    get_group(){
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}`
      this.loading = true;
      this.axios.get(url)
      .then(({data}) => { this.group = data })
      .catch(error => {
        // Todo: display proper error
        alert(`Error getting group`)
        if(error.response) console.log(error.response.data)
        else console.log(error)
      })
      .finally(() => this.loading = false)
    },

    delete_group(){
      if(!confirm(`Delete ${this.group.properties.name}?`)) return
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}`
      this.axios.delete(url)
      .then( () => { this.$router.push({name: 'groups_of_user', params: {user_id: 'self'}}) })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })

    },

    patch_group(){
      const group_id = this.group.identity.low || this.group.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${group_id}`
      this.axios.patch(url, this.group.properties )
      .then( () => {
        alert(`Success`)
        this.get_group()
      })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })
    },

    leave_group(){
      if(!confirm(`Leave group ${this.group.properties.name}?`)) return
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/leave`
      this.axios.post(url)
      .then( () => { this.get_members_of_group() })
      .catch(error => console.log(error))

    },
    join_group(){
      if(!confirm(`Join group ${this.group.properties.name}?`)) return
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/join`
      this.axios.post(url)
      .then( () => { this.get_members_of_group() })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })
    },

  },
  computed: {
    group_id(){
      return this.$route.query.id
        || this.$route.query.group_id
        || this.$route.params.group_id
    },

    current_user_is_admin(){
      if(!this.$store.state.current_user) return false
      return this.$store.state.current_user.properties.isAdmin
    },
    current_user_id() {
      return this.$store.state.current_user.identity.low
        || this.$store.state.current_user.identity
    },
    group_avatar_src(){
      if(this.group.properties.avatar_src) return this.group.properties.avatar_src
      else return require("@/assets/account-multiple.svg")
    },
    group_page_url() {
      return `${process.env.VUE_APP_GROUP_MANAGER_FRONT_URL}/group`
    },
    user_page_url(){
      return `${process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL}/`
    }

  }
}
</script>

<style scoped>
h1 {
  margin-bottom: 0.2em;
}
.avatar_wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.group_header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar {
  width: 10vw;
  height: 10vw;
  object-fit: contain;
}


.loader_wrapper {
  margin-top: 3em;
  display: flex;
  justify-content: center;
  font-size: 150%;
}


.group_properties_table {
  border-collapse: collapse;
  width: 100%;
}

.group_properties_table td{
  padding: 0.25em;
}

.group_properties_table tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.group_properties_table input[type="text"] {
  width: 100%;
}




</style>
