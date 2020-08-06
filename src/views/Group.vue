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
        ID: {{group.identity.low}}
      </div>

      <div class="avatar_wrapper">
        <img
          class="avatar"
          v-bind:class="{avatar_clickable: current_user_is_admin_of_group}"
          v-bind:src="group_avatar_src">
      </div>







      <!-- members -->
      <div class="section">
        <h2 class="">Members</h2>
        <div class="" v-if="members.error">{{members.error}}</div>
        <Loader v-else-if="members.loading">Loading members</Loader>
        <template v-else>

          <div class="members_container" v-if="members.length > 0">
            <UserPreview
              v-bind:user="member"
              v-for="member in members"
              v-bind:key="`member_${member.identity.low}`">
              <!-- Admin controls on member-->
              <template v-if="!user_is_current_user(member) && current_user_is_admin_of_group">
                <!-- Button to remove member from group -->
                <button
                  type="button"
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

              <template v-if="user_is_current_user(member)" >
                <!-- button to leave group -->
                <button
                  type="button"
                  v-on:click.stop="leave_group()"
                  v-if="current_user_is_member_of_group">
                  <font-awesome-icon icon="sign-out-alt"/>
                  <span>Leave</span>
                </button>
              </template>
            </UserPreview>
          </div>
          <div class="" v-else>No member</div>
        </template>
      </div>


      <!-- Administrators -->
      <div class="section">
        <h2 class="">Administrators</h2>
        <div class="" v-if="administrators.error">{{administrators.error}}</div>
        <Loader v-else-if="administrators.loading">Loading administrators</Loader>
        <template v-else>
          <div class="members_container" v-if="administrators.length > 0">
            <UserPreview
              v-bind:user="administrator"
              v-for="administrator in administrators"
              v-bind:key="`administrator_${administrator.identity.low}`">

              <!-- Cannot remove oneself from admins -->
              <template v-if="!user_is_current_user(administrator) && current_user_is_admin_of_group">
                <!-- Button to remove member from administrators -->
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
      </div>


      <!-- Groups -->
      <div class="section">
        <h2 class="">Groups</h2>
        <div class="" v-if="groups.error">{{groups.error}}</div>
        <Loader v-else-if="groups.loading">Loading groups</Loader>
        <template v-else>
          <div class="members_container" v-if="groups.length > 0">

            <GroupPreview
              :group="group"
              v-for="group in groups"
              v-bind:key="group.identity.low">

              <!-- Admin controls on group-->
              <template v-if="current_user_is_admin_of_group">
                <!-- Button to remove member from group -->
                <button
                  type="button"
                  v-on:click.stop="remove_group_from_group(group)" >
                  <font-awesome-icon icon="sign-out-alt"/>
                  <span>Remove</span>
                </button>
              </template>

            </GroupPreview>

          </div>
          <div class="" v-else>No groups</div>
        </template>



      </div>


      <!-- Parent Groups -->
      <div class="section">
        <h2 class="">Parent Groups</h2>
        <div class="" v-if="parent_groups.error">{{parent_groups.error}}</div>
        <Loader v-else-if="parent_groups.loading">Loading parent groups</Loader>
        <template v-else>
          <div class="members_container" v-if="parent_groups.length > 0">
            <GroupPreview
            :group="group"
            v-for="group in parent_groups"
            v-bind:key="`parent_${group.identity.low}`"/>
          </div>
          <div class="" v-else>No parent groups</div>
        </template>
      </div>





      <!-- Admin controls of the group -->
      <div class="section" v-if="current_user_is_admin_of_group">

        <h2>Admin area</h2>

        <div class="">

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

        </div>



        <!-- User picker to add people to the group -->
        <h3 class="">Add members to {{group.properties.name}}</h3>
        <UserPicker
          class="user_picker"
          :apiUrl="picker_api_url"
          @selection="add_user_to_group($event)"/>

        <h3 class="">Add groups to {{group.properties.name}}</h3>
        <div class="user_picker">
          <GroupPicker
            class="group_picker"
            :apiUrl="picker_api_url"
            @selection="add_group_to_group($event)"/>
        </div>

      </div>



    </template>

    <div class="loader_wrapper" v-if="loading">
      <Loader message="Loading group..."/>
    </div>







  </div>
</template>

<script>

import Loader from '@moreillon/vue_loader'


import UserPicker from '@moreillon/vue_user_picker'
import GroupPicker from '@moreillon/vue_group_picker'


import UserPreview from '@/components/UserPreview.vue'
import GroupPreview from '@/components/GroupPreview.vue'


// Icons
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEdit,
  faSave,
  faSignInAlt,
  faSignOutAlt,
  faUserTie,
  faUserSlash,
  faTrash,

} from '@fortawesome/free-solid-svg-icons'

library.add(
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

      current_user: null,
      group: null,
      loading: false,

      members: [],
      administrators: [],
      groups: [],
      parent_groups: [],
    }
  },
  watch: {
    group_id(){
      this.get_current_user()
      this.get_group()
    }
  },
  mounted(){
    this.get_current_user()
    this.get_group()
  },
  methods: {
    get_current_user(){
      this.axios.get(`${process.env.VUE_APP_AUTHENTICATION_MANAGER_URL}/whoami`)
      .then(response => {
        this.current_user = response.data
      })
      .catch(error => console.log(error))
    },
    get_group(){

      let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}`

      this.loading = true;
      this.axios.get(url)
      .then(response => {
        this.group = response.data
        this.get_members_of_group()
        this.get_administrators_of_group()
        this.get_groups_of_group()
        this.get_parent_groups_of_group()
      })
      .catch(error => {
        if(error.response) console.log(error.response.data)
        else console.log(error)
      })
      .finally(() => this.loading = false)
    },
    get_members_of_group(){
      this.$set(this.members,'loading',true)
      let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}/members`
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
    get_groups_of_group(){
      this.$set(this.groups,'loading',true)
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}/groups`, {
        params: { id: this.group_id }
      })
      .then(response => {
        this.groups = []
        response.data.forEach((record) => {
          this.groups.push(record._fields[record._fieldLookup['group']])
        })
       })
       .catch( (error) => {
         console.log(error)
         this.$set(this.groups,'error','Error')
       })
       .finally(() => this.$set(this.groups,'loading',false))
    },
    get_parent_groups_of_group(){
      this.$set(this.parent_groups,'loading',true)
      let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group_id}/parent_groups`
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
      if(confirm(`Delete ${this.group.properties.name}?`)){
        let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group.identity.low}`
        this.axios.delete(url)
        .then( () => { this.$router.push({name: 'groups'}) })
        .catch(error => console.log(error))
      }

    },
    get_administrators_of_group(){
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group.identity.low}/administrators`)
      .then(response => {
        this.administrators.splice(0,this.administrators.length)
        response.data.forEach((record) => {
          this.administrators.push(record._fields[record._fieldLookup['user']])
        });

       })
      .catch(error => console.log(error))
    },
    leave_group(){
      if(confirm(`Leave ${this.group.properties.name}?`)){
        let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group.identity.low}/leave`
        this.axios.post(url)
        .then( () => { this.get_members_of_group() })
        .catch(error => console.log(error))
      }

    },
    join_group(){
      if(confirm(`Join ${this.group.properties.name}?`)){
        let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group.identity.low}/join`
        this.axios.post(url)
        .then( () => { this.get_members_of_group() })
        .catch(error => console.log(error))
      }
    },
    add_user_to_group(user){
      if(confirm(`Add ${user.properties.name_kanji} to ${this.group.properties.name}?`)){

        let group_id = this.group.identity.low
        let user_id = user.identity.low
        let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/members/${user_id}`

        this.axios.post(url)
        .then( () => { this.get_members_of_group() })
        .catch(error => console.log(error))
      }
    },
    remove_user_from_group(user){
      if(confirm(`Remove ${user.properties.name_kanji} from ${this.group.properties.name}?`)){

        let group_id = this.group.identity.low
        let user_id = user.identity.low
        let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/members/${user_id}`

        this.axios.delete(url)
        .then( () => { this.get_members_of_group() })
        .catch(error => console.log(error))
      }
    },
    make_user_administrator_of_group(user){
      if(confirm(`Make ${user.properties.name_kanji} admin of ${this.group.properties.name}?`)){

        let group_id = this.group.identity.low
        let user_id = user.identity.low
        let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/administrators/${user_id}`

        this.axios.post(url)
        .then( () => { this.get_administrators_of_group() })
        .catch(error => console.log(error))
      }

    },
    remove_user_from_administrators(user){
      if(confirm(`Remove ${user.properties.name_kanji} from administrators of ${this.group.properties.name}?`)){
        let group_id = this.group.identity.low
        let user_id = user.identity.low
        let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/administrators/${user_id}`

        this.axios.delete(url)
        .then( () => { this.get_administrators_of_group() })
        .catch(error => console.log(error))
      }

    },
    add_group_to_group(group){
      if(confirm(`Add ${group.properties.name} to ${this.group.properties.name}?`)){

        let parent_group_id = this.group.identity.low
        let child_group_id = group.identity.low
        let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${parent_group_id}/groups/${child_group_id}`

        this.axios.post(url)
        .then( () => {
          this.get_groups_of_group()
        })
        .catch(error => console.log(error))
      }
    },
    remove_group_from_group(group){
      if(confirm(`Remove ${group.properties.name} from ${this.group.properties.name}?`)) {
        let parent_group_id = this.group.identity.low
        let child_group_id = group.identity.low
        let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${parent_group_id}/groups/${child_group_id}`
        this.axios.delete(url)
        .then( () => { this.get_groups_of_group() })
        .catch(error => console.log(error))
      }

    },
    patch_group(){
      let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${this.group.identity.low}`
      this.axios.patch(url,
        this.group.properties
      )
      .then( () => {
        this.get_group()
      })
      .catch(error => console.log(error))
    },

    view_profile_of_user(user){
      this.$router.push({name: 'profile', query: {id: user.identity.low}})
    },
    user_is_current_user(user){
      if(!this.current_user) return false
      return user.identity.low === this.current_user.identity.low
    },




  },
  computed: {
    group_id(){
      return this.$route.query.id
        || this.$route.query.group_id
        || this.$route.params.group_id
    },
    current_user_is_member_of_group(){
      if(!this.current_user) return false
      if(this.members.length < 1) return false
      let found = this.members.find( member => {
        return member.identity.low === this.current_user.identity.low
      })
      return !!found
    },
    current_user_is_admin_of_group(){
      if(!this.current_user) return false
      if(this.administrators.length < 1) return false
      let found = this.administrators.find( administrator => {
        return administrator.identity.low === this.current_user.identity.low
      })
      return !!found
    },
    current_user_is_admin(){
      if(!this.current_user) return false
      return this.current_user.properties.isAdmin
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

button {
  border: 1px solid #666666;
  border-radius: 5px;
  outline: none;
  background-color: transparent;
  padding: 5px;
  cursor: pointer;
}

button:hover {
  color: #c00000;
  border-color: #c00000;
}

button:not(:last-child){
  margin-right: 5px;
}
button > *:not(:last-child){
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
</style>
