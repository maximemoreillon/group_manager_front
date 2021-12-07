<template>
  <div class="members">
    <h2 class="">Members</h2>
    <div class="" v-if="members.error">{{members.error}}</div>
    <Loader v-else-if="members.loading">Loading members</Loader>
    <template v-else>

      <div class="toolbar">
        <span class="member_count">{{members.length}} member(s)</span>
        <div class="spacer"/>
        <button
          type="button"
          v-on:click="excel_export(members)" >
          <font-awesome-icon icon="file-export" />
          <span>Export</span>
        </button>

        <template v-if="current_user_is_admin_of_group || current_user_is_admin">
          <button
            type="button"
            v-on:click="member_modal_open = true" >
            <font-awesome-icon icon="user-plus" />
            <span>Add member</span>
          </button>
        </template>
      </div>




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
            <!-- <button
              type="button"
              v-on:click.stop="make_user_administrator_of_group(member)" >
              <font-awesome-icon icon="user-tie"/>
              <span>Make admin</span>
            </button> -->
          </template>


        </UserPreview>
      </div>
      <div class="" v-else>No member</div>
    </template>

    <Modal
      :open="member_modal_open"
      @close="member_modal_open=false">
      <h2>Add member to group</h2>
      <div class="modal_picker_wrapper">
        <UserPicker
          v-if="member_modal_open"
          class="modal_picker"
          @selection="add_user_to_group($event)"/>
      </div>
    </Modal>


  </div>
</template>

<script>
import Loader from '@moreillon/vue_loader'
import Modal from '@moreillon/vue_modal'
import XLSX from 'xlsx'

import UserPicker from '@moreillon/vue_user_picker'
import UserPreview from '@/components/UserPreview.vue'

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
  name: 'Members',
  props: {
    group: Object,
    current_user_is_admin_of_group: Boolean,
  },
  data(){
    return {
      members: [],
      member_modal_open: false,
    }
  },
  components: {
    UserPicker,
    Loader,
    Modal,
    UserPreview,
    FontAwesomeIcon,

  },
  mounted(){
    this.get_members_of_group()

  },
  methods: {
    get_members_of_group(){
      this.$set(this.members,'loading',true)
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/members`
      this.axios.get(url)
      .then(({data}) => {
        this.members = data
        if(this.current_user_is_member_of_group) this.$emit('user_is_member')
      })
       .catch( () => this.$set(this.members,'error','Error'))
       .finally(() => this.$set(this.members,'loading',false))
    },

    add_user_to_group(user){
      if(!confirm(`Add user ${user.properties.display_name} to group ${this.group.properties.name}?`)) return
      const user_id = user.identity.low || user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/members/${user_id}`

      this.axios.post(url)
      .then( () => {
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

      const user_id = user.identity.low || user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/members/${user_id}`

      this.axios.delete(url)
      .then( () => {
        this.get_members_of_group()
      })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })
    },
    user_is_current_user(user){
      if(!this.$store.state.current_user) return false
      const user_id = user.identity.low || user.identity
      return user_id === this.current_user_id
    },
    leave_group(){
      if(!confirm(`Leave group ${this.group.properties.name}?`)) return
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/leave`
      this.axios.post(url)
      .then( () => {
        this.get_members_of_group()
        this.$emit('groupLeft')
      })
      .catch(error => console.log(error))

    },
    excel_export(list){
      const formatted_list = list.map(i => {
        const formatted_entry = i.properties
        delete formatted_entry.password_hashed
        delete formatted_entry.password_changed
        delete formatted_entry.last_login
        delete formatted_entry.avatar_src
        delete formatted_entry.locked
        return formatted_entry
      })

      const workbook = XLSX.utils.book_new()
      const ws1 = XLSX.utils.json_to_sheet(formatted_list)
      XLSX.utils.book_append_sheet(workbook, ws1, 'Sheet1')
      XLSX.writeFile(workbook, `group_manager_${this.group.properties.name}_export.xlsx`)
    }
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
