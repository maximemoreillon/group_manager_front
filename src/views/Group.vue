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

        <button
          type="button"
          v-on:click="change_avatar()"
          v-if="current_user_is_admin_of_group">
          <font-awesome-icon icon="edit"/>
          <span>Change avatar</span>
        </button>

      </div>







      <!-- members -->
      <div class="">
        <h2 class="">Members ({{members.length}})</h2>

        <div class="members_container" v-if="members.length > 0">

          <div class="member"
            v-for="member in members"
            v-bind:key="`member_${member.identity.low}`" >

            <UserPreview
            :user="member"
            :profileUrl="user_page_url"/>

            <div class="growing_space"/>

            <!-- Admin controls on member-->
            <template v-if="!user_is_current_user(member) && current_user_is_admin_of_group">
              <!-- Button to remove member from group -->
              <button
                type="button"
                v-on:click="remove_user_from_group(member)" >
                <font-awesome-icon icon="sign-out-alt" />
                <span>Remove</span>
              </button>

              <!-- Make user an administrator -->
              <button
                type="button"
                v-on:click="make_user_administrator_of_group(member)" >
                <font-awesome-icon icon="user-tie"/>
                <span>Make admin</span>

              </button>
            </template>

            <template v-if="user_is_current_user(member)" >
              <button
                type="button"
                v-on:click="leave_group()"
                v-if="current_user_is_member_of_group">
                <font-awesome-icon icon="sign-out-alt"/>
                <span>Leave</span>
              </button>
            </template>

          </div>

        </div>
      </div>


      <!-- Administrators -->
      <h2 class="">Administrators ({{administrators.length}})</h2>
      <div class="members_container" v-if="administrators.length > 0">

        <div class="member"
          v-for="administrator in administrators"
          v-bind:key="`administrator_${administrator.identity.low}`" >

          <UserPreview
          :user="administrator"
          :profileUrl="user_page_url"/>

          <div class="growing_space" />

          <template v-if="!user_is_current_user(administrator)">
            <!-- Button to remove member from administrators -->
            <button
              type="button"
              v-on:click="remove_user_from_administrators(administrator)"
              v-if="current_user_is_admin_of_group">

              <font-awesome-icon icon="user-slash"/>
              <span>Remove from admins</span>


            </button>
          </template>

        </div>

      </div>

      <!-- Groups -->
      <h2 class="">Groups ({{groups.length}})</h2>
      <div class="members_container" v-if="groups.length > 0">

        <div class="member"
          v-for="group in groups"
          v-bind:key="group.identity.low" >

          <GroupPreview
          :group="group"/>

          <div class="growing_space" />

          <!-- Admin controls on group-->
          <template v-if="current_user_is_admin_of_group">
            <!-- Button to remove member from group -->
            <button
              type="button"
              v-on:click="remove_group_from_group(group)" >
              <font-awesome-icon icon="sign-out-alt"/>
              <span>Remove</span>
            </button>


          </template>


        </div>

      </div>




      <!-- Admin controls of the group -->
      <template v-if="current_user_is_admin_of_group">

        <h2>Admin area</h2>

        <div class="">
          <div class="">
            <input
              type="checkbox"
              v-model="group.properties.restricted"
              v-on:change="set_group_restriction()"> Restricted
          </div>


          <div class="" v-if="current_user.properties.isAdmin">
            <input
              type="checkbox"
              v-model="group.properties.official"
              v-on:change="set_group_officiality()"> Official
          </div>



          <!-- delete group button -->
          <button
            type="button"
            v-on:click="delete_group()">
            <font-awesome-icon icon="trash"/>
            <span>Delete group</span>
          </button>
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
            class=""
            :apiUrl="picker_api_url"
            @selection="add_group_to_group($event)"/>
        </div>

      </template>



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
  faSignInAlt,
  faSignOutAlt,
  faUserTie,
  faUserSlash,
  faTrash,

} from '@fortawesome/free-solid-svg-icons'

library.add(
  faEdit,
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
      current_user: null,
      group: null,
      loading: false,

      members: [],
      administrators: [],
      groups: [],

      user_picker_open: false,

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
      this.loading = true;
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/group`, {
        params: { id: this.$route.query.id }
      })
      .then(response => {
        this.group = response.data
        this.get_members_of_group()
        this.get_administrators_of_group()
        this.get_groups_of_group()
      })
      .catch(error => {
        if(error.response) console.log(error.response.data)
        else console.log(error)
      })
      .finally(() => this.loading = false)
    },
    get_members_of_group(){
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/users_of_group`, {
        params: { id: this.$route.query.id }
      })
      .then(response => {
        this.members.splice(0,this.members.length)
        response.data.forEach((record) => {
          this.members.push(record._fields[record._fieldLookup['user']])
        });

       })
      .catch(error => console.log(error))
    },
    get_groups_of_group(){
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups_of_group`, {
        params: { id: this.$route.query.id }
      })
      .then(response => {
        this.groups.splice(0,this.groups.length)
        response.data.forEach((record) => {
          this.groups.push(record._fields[record._fieldLookup['group']])
        });

       })
      .catch(error => console.log(error))
    },
    delete_group(){
      if(confirm(`Delete ${this.group.properties.name}?`)){
        this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/delete_group`, {
          id: this.group.identity.low,
        })
        .then( () => {
          this.$router.push({name: 'groups'})
         })
        .catch(error => console.log(error))
      }

    },
    get_administrators_of_group(){
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/administrators_of_group`, {
        params: { id: this.$route.query.id }
      })
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
        this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/leave_group`, {
          group_id: this.group.identity.low,
        })
        .then( () => { this.get_members_of_group() })
        .catch(error => console.log(error))
      }

    },
    join_group(){
      if(confirm(`Join ${this.group.properties.name}?`)){
        this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/join_group`, {
          group_id: this.group.identity.low,
        })
        .then( () => { this.get_members_of_group() })
        .catch(error => console.log(error))
      }
    },
    add_user_to_group(user){
      if(confirm(`Add ${user.properties.name_kanji} to ${this.group.properties.name}?`)){
        this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/add_user_to_group`, {
          group_id: this.group.identity.low,
          user_id: user.identity.low
        })
        .then( () => { this.get_members_of_group() })
        .catch(error => console.log(error))
      }
    },
    remove_user_from_group(user){
      if(confirm(`Remove ${user.properties.name_kanji} from ${this.group.properties.name}?`))
      this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/remove_user_from_group`, {
        group_id: this.group.identity.low,
        user_id: user.identity.low
      })
      .then( () => { this.get_members_of_group() })
      .catch(error => console.log(error))
    },
    make_user_administrator_of_group(user){
      if(confirm(`Make ${user.properties.name_kanji} admin of ${this.group.properties.name}?`))
      this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/make_user_administrator_of_group`, {
        group_id: this.group.identity.low,
        user_id: user.identity.low
      })
      .then( () => { this.get_administrators_of_group() })
      .catch(error => console.log(error))
    },
    remove_user_from_administrators(user){
      if(confirm(`Remove ${user.properties.name_kanji} from administrators of ${this.group.properties.name}?`))
      this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/remove_user_from_administrators`, {
        group_id: this.group.identity.low,
        user_id: user.identity.low
      })
      .then( () => { this.get_administrators_of_group() })
      .catch(error => console.log(error))
    },
    add_group_to_group(group){
      if(confirm(`Add ${group.properties.name} to ${this.group.properties.name}?`)){
        this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/add_group_to_group`, {
          parent_group_id: this.group.identity.low,
          child_group_id: group.identity.low
        })
        .then( () => {
          this.get_groups_of_group()
        })
        .catch(error => console.log(error))
      }
    },
    remove_group_from_group(group){
      if(confirm(`Remove ${group.properties.name} from ${this.group.properties.name}?`))
      this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/remove_group_from_group`, {
        parent_group_id: this.group.identity.low,
        child_group_id: group.identity.low
      })
      .then( () => { this.get_groups_of_group() })
      .catch(error => console.log(error))
    },
    set_group_restriction(){
      if(confirm(`Update restrictions on ${this.group.properties.name}?`)){
        this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/set_group_restriction`, {
          id: this.group.identity.low,
          restricted: this.group.properties.restricted,
        })
        .then( (response) => {
          console.log(response.data)
          this.get_group()
        })
        .catch(error => console.log(error))
      }
    },
    set_group_officiality(){
      if(confirm(`Update officiality of ${this.group.properties.name}?`)){
        this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/set_group_officiality`, {
          id: this.group.identity.low,
          official: this.group.properties.official,
        })
        .then( (response) => {
          console.log(response.data)
          this.get_group()
        })
        .catch(error => console.log(error))
      }
    },
    view_profile_of_user(user){
      this.$router.push({name: 'profile', query: {id: user.identity.low}})
    },
    user_is_current_user(user){
      if(!this.current_user) return false
      return user.identity.low === this.current_user.identity.low
    },
    change_avatar(){
      if(this.user_is_current_user){
        let avatar_src = prompt('URL')
        if(avatar_src){
          this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/update_avatar`, {
            group_id: this.group.identity.low,
            avatar_src: avatar_src
          })
          .then( () => { this.get_group() })
          .catch(error => {
            if(error.response) alert(error.response.data)
            else alert(error)
          })
        }
      }
    }



  },
  computed: {
    picker_api_url(){
      return process.env.VUE_APP_GROUP_MANAGER_API_URL
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
.group_name {
  font-size: 200%;
}

.user_picker{
  height: 250px;
}

.members_container{
  max-height: 300px;
  overflow-y: auto;
}
.member {
  display: flex;
  border-bottom: 1px solid #dddddd;
  padding: 5px;
}
.member:last-child {
  border: none;
}
.member:hover{
  background-color: #eeeeee;
}
.growing_space {
  flex-grow: 1;
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
</style>
