<template>
  <div class="group">
    <template v-if="group && !loading">



      <div class="group_header">
        <h1 class="">{{group.properties.name}}</h1>
        <!--Button to leave group -->
        <button
          type="button"
          v-on:click="leave_group()"
          v-if="current_user_is_member_of_group">
          <font-awesome-icon icon="sign-out-alt" />
          <span>Leave</span>
        </button>

        <!-- Button to join group if possible -->
        <button
          type="button"
          v-on:click="join_group()"
          v-if="!current_user_is_member_of_group">
          <font-awesome-icon icon="sign-in-alt" />
          <span>Join</span>
        </button>
      </div>

      <div class="group_id">
        ID: {{group.identity.low || group.identity}}
      </div>

      <div class="avatar_wrapper">
        <img
          class="avatar"
          v-bind:class="{avatar_clickable: current_user_is_admin_of_group}"
          v-bind:src="group_avatar_src">
      </div>



      <!-- members -->
      <h2 class="">Members</h2>
      <div class="" v-if="members.error">{{members.error}}</div>
      <Loader v-else-if="members.loading">Loading members</Loader>
      <template v-else>

        <!-- P not vey nice -->
        <p v-if="current_user_is_admin_of_group || current_user_is_admin">
          <button
            type="button"
            v-on:click="member_modal_open = true" >
            <font-awesome-icon icon="user-plus" />
            <span>Add member</span>
          </button>
        </p>


        <div class="members_container" v-if="members.length > 0">
          <UserPreview
            v-bind:user="member"
            v-for="(member, index) in members"
            v-bind:key="`member_${index}`">

            <!-- button to leave group -->
            <button
              type="button"
              v-on:click.stop="leave_group()"
              v-if="current_user_is_member_of_group && user_is_current_user(member)">
              <font-awesome-icon icon="sign-out-alt"/>
              <span>Leave</span>
            </button>

            <!-- Admin controls on members -->
            <template
              v-if="(!user_is_current_user(member)
              && current_user_is_admin_of_group)
              || current_user_is_admin">

              <!-- Button to remove member from group -->
              <button
                type="button"
                v-if="!user_is_current_user(member)"
                v-on:click.stop="remove_user_from_group(member)" >
                <font-awesome-icon icon="sign-out-alt" />
                <span>Remove</span>
              </button>

              <!-- Make user an administrator -->
              <button
                type="button"
                v-on:click.stop="make_user_administrator_of_group(member)" >
                <font-awesome-icon icon="user-tie"/>
                <span>Make admin</span>
              </button>
            </template>


          </UserPreview>
        </div>
        <div class="" v-else>No member</div>
      </template>


      <!-- Administrators -->
      <h2 class="">Administrators</h2>
      <div class="" v-if="administrators.error">{{administrators.error}}</div>
      <Loader v-else-if="administrators.loading">Loading administrators</Loader>
      <template v-else>

        <!-- P not vey nice -->
        <p v-if="current_user_is_admin_of_group || current_user_is_admin">
          <button
            type="button"
            v-on:click="administrator_modal_open = true" >
            <font-awesome-icon icon="user-plus" />
            <span>Add administrator</span>
          </button>
        </p>

        <div class="members_container" v-if="administrators.length > 0">
          <UserPreview
            v-bind:user="administrator"
            v-for="(administrator, index) in administrators"
            v-bind:key="`administrator_${index}`">

            <!-- Button to remove member from administrators -->
            <!-- Cannot remove oneself from admins -->
            <template
              v-if="(!user_is_current_user(administrator)
                && current_user_is_admin_of_group)
                || current_user_is_admin">
              <button
                type="button"
                v-on:click.stop="remove_user_from_administrators(administrator)">
                <font-awesome-icon icon="user-slash"/>
                <span>Remove from admins</span>
              </button>
            </template>

          </UserPreview>
        </div>
        <div class="" v-else>No Administrator</div>
      </template>


      <!-- Groups -->
      <h2 class="">Child groups</h2>
      <div class="" v-if="child_groups.error">{{child_groups.error}}</div>
      <Loader v-else-if="child_groups.loading">Loading groups</Loader>
      <template v-else>
        <!-- P not vey nice -->
        <p v-if="current_user_is_admin_of_group || current_user_is_admin">
          <button
            type="button"
            v-on:click="child_group_modal_open = true" >
            <font-awesome-icon icon="plus" />
            <span>Add child group</span>
          </button>
        </p>

        <div class="members_container" v-if="child_groups.length > 0">

          <GroupPreview
            :group="child_group"
            v-for="(child_group, index) in child_groups"
            v-bind:key="`child_group_${index}`">

            <!-- Button to remove group from group -->
            <template
              v-if="current_user_is_admin_of_group || current_user_is_admin">
              <button
                type="button"
                v-on:click.stop="remove_child_group_from_parent_group(child_group, group)" >
                <font-awesome-icon icon="sign-out-alt"/>
                <span>Remove</span>
              </button>
            </template>

          </GroupPreview>

        </div>
        <div class="" v-else>No groups</div>
      </template>

      <!-- Parent Groups -->
      <h2 class="">Parent Groups</h2>
      <div class="" v-if="parent_groups.error">{{parent_groups.error}}</div>
      <Loader v-else-if="parent_groups.loading">Loading parent groups</Loader>
      <template v-else>

        <p v-if="current_user_is_admin_of_group || current_user_is_admin">
          <button
            type="button"
            v-on:click="parent_group_modal_open = true" >
            <font-awesome-icon icon="plus" />
            <span>Add parent group</span>
          </button>
        </p>

        <div class="members_container" v-if="parent_groups.length > 0">
          <GroupPreview
            v-for="(parent_group, index) in parent_groups"
            :group="parent_group"
            v-bind:key="`parent_group_${index}`">

            <!-- Admin controls on group-->
            <template
              v-if="current_user_is_admin_of_group || current_user_is_admin">
              <!-- Button to remove group from group -->
              <button
                type="button"
                v-on:click.stop="remove_child_group_from_parent_group(group, parent_group)" >
                <font-awesome-icon icon="sign-out-alt"/>
                <span>Remove</span>
              </button>
            </template>

          </GroupPreview>
        </div>
        <div class="" v-else>No parent groups</div>
      </template>





      <!-- Admin controls of the group -->
      <template
        v-if="current_user_is_admin_of_group || current_user_is_admin">

        <h2>Admin area</h2>


        <h3>Group options</h3>

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


      <Modal
        :open="member_modal_open"
        @close="member_modal_open=false">
        <h2>Add member to group</h2>
        <div class="modal_picker_wrapper">
          <UserPicker
            class="modal_picker"
            :apiUrl="picker_api_url"
            @selection="add_user_to_group($event)"/>
        </div>
      </Modal>

      <Modal
        :open="administrator_modal_open"
        @close="administrator_modal_open=false">
        <h2>Add administrator to group</h2>
        <div class="modal_picker_wrapper">
          <UserPicker
            class="modal_picker"
            :apiUrl="picker_api_url"
            @selection="make_user_administrator_of_group($event)"/>
        </div>
      </Modal>

      <Modal
        :open="child_group_modal_open"
        @close="child_group_modal_open=false">
        <h2>Add child group to current group</h2>
        <div class="modal_picker_wrapper">
          <GroupPicker
            :usersWithNoGroup="false"
            class="modal_picker"
            :apiUrl="picker_api_url"
            @selection="add_child_group_to_parent_group($event, group)"/>
        </div>
      </Modal>

      <Modal
        :open="parent_group_modal_open"
        @close="parent_group_modal_open=false">
        <h2>Add current group to parent group</h2>
        <div class="modal_picker_wrapper">
          <GroupPicker
            :usersWithNoGroup="false"
            class="modal_picker"
            :apiUrl="picker_api_url"
            @selection="add_child_group_to_parent_group(group, $event)"/>
        </div>
      </Modal>

    </template>

    <div class="loader_wrapper" v-if="loading">
      <Loader message="Loading group..."/>
    </div>










  </div>
</template>

<script>

import Loader from '@moreillon/vue_loader'
import Modal from '@moreillon/vue_modal'


import UserPicker from '@moreillon/vue_user_picker'
import GroupPicker from '@moreillon/vue_group_picker'


import UserPreview from '@/components/UserPreview.vue'
import GroupPreview from '@/components/GroupPreview.vue'


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

)

export default {
  name: 'Group',
  components: {
    Loader,
    Modal,
    UserPicker,
    GroupPicker,

    UserPreview,
    GroupPreview,

    FontAwesomeIcon,
  },
  data(){
    return {

      // Won't be needed anymore
      picker_api_url: process.env.VUE_APP_GROUP_MANAGER_API_URL,

      group: null,
      loading: false,

      members: [],
      administrators: [],
      child_groups: [],
      parent_groups: [],

      member_modal_open: false,
      administrator_modal_open: false,
      child_group_modal_open: false,
      parent_group_modal_open: false,
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

      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}`

      this.loading = true;
      this.axios.get(url)
      .then(response => {
        this.group = response.data
        this.get_members_of_group()
        this.get_administrators_of_group()
        this.get_child_groups_of_group()
        this.get_parent_groups_of_group()
      })
      .catch(error => {
        // Todo: display proper error
        alert(`Error getting group`)
        if(error.response) console.log(error.response.data)
        else console.log(error)
      })
      .finally(() => this.loading = false)
    },
    get_members_of_group(){
      this.$set(this.members,'loading',true)
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}/members`
      this.axios.get(url)
      .then(response => {
        this.members = []
        response.data.forEach((record) => {
          this.members.push(record._fields[record._fieldLookup['user']])
        });
       })
       .catch( () => this.$set(this.members,'error','Error'))
       .finally(() => this.$set(this.members,'loading',false))
    },
    get_child_groups_of_group(){
      this.$set(this.child_groups,'loading',true)
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}/groups`
      const options = {
        params: { id: this.group_id }
      }
      this.axios.get(url,options )
      .then(response => {
        this.child_groups = []
        response.data.forEach((record) => {
          this.child_groups.push(record._fields[record._fieldLookup['group']])
        })
       })
       .catch( (error) => {
         console.log(error)
         this.$set(this.child_groups,'error','Error')
       })
       .finally(() => this.$set(this.child_groups,'loading',false))
    },
    get_parent_groups_of_group(){
      this.$set(this.parent_groups,'loading',true)
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}/parent_groups`
      this.axios.get(url)
      .then(response => {
        this.parent_groups = []
        response.data.forEach((record) => {
          this.parent_groups.push(record._fields[record._fieldLookup['group']])
        });

       })
      .catch( () => this.$set(this.parent_groups,'error','Error'))
      .finally(() => this.$set(this.parent_groups,'loading',false))
    },
    delete_group(){
      if(!confirm(`Delete ${this.group.properties.name}?`)) return
      const group_id = this.group.identity.low || this.group.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}`
      this.axios.delete(url)
      .then( () => { this.$router.push({name: 'groups_of_user', params: {user_id: 'self'}}) })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })


    },
    get_administrators_of_group(){
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}/administrators`)
      .then(response => {
        this.administrators.splice(0,this.administrators.length)
        response.data.forEach((record) => {
          this.administrators.push(record._fields[record._fieldLookup['user']])
        });

       })
       .catch(error => {
         alert(`System error`)
         console.error(error)
       })
    },
    leave_group(){
      if(!confirm(`Leave group ${this.group.properties.name}?`)) return
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}/leave`
      this.axios.post(url)
      .then( () => { this.get_members_of_group() })
      .catch(error => console.log(error))

    },
    join_group(){
      if(!confirm(`Join group ${this.group.properties.name}?`)) return
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}/join`
      this.axios.post(url)
      .then( () => { this.get_members_of_group() })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })
    },
    add_user_to_group(user){
      if(!confirm(`Add user ${user.properties.display_name} to group ${this.group.properties.name}?`)) return

      const group_id = this.group.identity.low || this.group.identity
      const user_id = user.identity.low || user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/members/${user_id}`

      this.axios.post(url)
      .then( () => {
        alert(`Success`)
        this.get_members_of_group()
        this.member_modal_open=false
      })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })
    },
    remove_user_from_group(user){
      if(!confirm(`Remove user ${user.properties.display_name} from group ${this.group.properties.name}?`)) return

      const group_id = this.group.identity.low || this.group.identity
      const user_id = user.identity.low || user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/members/${user_id}`

      this.axios.delete(url)
      .then( () => {
        alert(`Success`)
        this.get_members_of_group()
      })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })
    },
    make_user_administrator_of_group(user){
      if(!confirm(`Make user ${user.properties.display_name} admin of group ${this.group.properties.name}?`)) return

      const group_id = this.group.identity.low || this.group.identity
      const user_id = user.identity.low || user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/administrators/${user_id}`

      this.axios.post(url)
      .then( () => {
        alert(`Success`)
        this.get_administrators_of_group()
        this.administrator_modal_open=false
      })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })


    },
    remove_user_from_administrators(user){
      if(!confirm(`Remove ${user.properties.display_name} from administrators of ${this.group.properties.name}?`)) return

      const group_id = this.group.identity.low || this.group.identity
      const user_id = user.identity.low || user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/administrators/${user_id}`

      this.axios.delete(url)
      .then( () => {
        alert(`Success`)
        this.get_administrators_of_group()
      })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })


    },
    add_child_group_to_parent_group(child_group, parent_group){
      if(!confirm(`Add ${child_group.properties.name} to ${parent_group.properties.name}?`)) return

      const parent_group_id = parent_group.identity.low || parent_group.identity
      const child_group_id = child_group.identity.low || child_group.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${parent_group_id}/groups/${child_group_id}`

      this.axios.post(url)
      .then( () => {
        this.child_group_modal_open=false
        this.parent_group_modal_open=false
        this.get_group()
      })
      .catch(error => {
        alert(`Invalid operation`)
        console.error(error)
      })
    },
    remove_child_group_from_parent_group(child_group, parent_group){
      if(!confirm(`Remove ${child_group.properties.name} from ${parent_group.properties.name}?`)) return

      const parent_group_id = parent_group.identity.low || parent_group.identity
      const child_group_id = child_group.identity.low || child_group.identity

      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${parent_group_id}/groups/${child_group_id}`
      this.axios.delete(url)
      .then( () => {
        this.get_group()
      })
      .catch(error => {
        alert(`Invalid operation`)
        console.error(error)
      })
    },
    patch_group(){
      const group_id = this.group.identity.low || this.group.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}`
      this.axios.patch(url,
        this.group.properties
      )
      .then( () => {
        alert(`Success`)
        this.get_group()
      })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })
    },

    view_profile_of_user(user){
      const id = user.identity.low || user.identity
      this.$router.push({name: 'profile', query: {id}})
    },
    user_is_current_user(user){
      if(!this.$store.state.current_user) return false
      const user_id = user.identity.low || user.identity
      return user_id === this.current_user_id
    },




  },
  computed: {
    group_id(){
      return this.$route.query.id
        || this.$route.query.group_id
        || this.$route.params.group_id
    },
    current_user_is_member_of_group(){
      if(!this.$store.state.current_user) return false
      if(this.members.length < 1) return false
      let found = this.members.find( member => {
        const member_id = member.identity.low || member.identity
        return member_id === this.current_user_id
      })
      return !!found
    },
    current_user_is_admin_of_group(){
      if(!this.$store.state.current_user) return false
      if(this.administrators.length < 1) return false
      let found = this.administrators.find( administrator => {
        const administrator_id = administrator.identity.low || administrator.identity
        return administrator_id === this.current_user_id
      })
      return !!found
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
  margin-bottom: 0;
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


.user_picker, .group_picker{
  height: 250px;
}

.members_container{
  max-height: 300px;
  overflow-y: auto;
}


button:not(:last-child){
  margin-right: 5px;
}


.loader_wrapper {
  display: flex;
  justify-content: center;
  font-size: 150%;
}

.section {

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
