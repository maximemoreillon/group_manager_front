<template>
  <div class="administrators">
    <h2 class="">Administrators</h2>
    <div class="" v-if="administrators.error">{{administrators.error}}</div>
    <Loader v-else-if="administrators.loading">Loading administrators</Loader>
    <template v-else>

      <div class="toolbar">
        <span class="member_count">{{administrators.length}} administrator(s)</span>
        <div class="spacer"/>
        <template v-if="current_user_is_admin_of_group || current_user_is_admin">
          <button
            type="button"
            v-on:click="administrator_modal_open = true" >
            <font-awesome-icon icon="user-plus" />
            <span>Add administrator</span>
          </button>
        </template>
      </div>

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

    <Modal
      :open="administrator_modal_open"
      @close="administrator_modal_open=false">
      <h2>Add administrator to group</h2>
      <div class="modal_picker_wrapper">
        <UserPicker
          v-if="administrator_modal_open"
          class="modal_picker"
          @selection="make_user_administrator_of_group($event)"/>
      </div>
    </Modal>

  </div>
</template>

<script>
import Loader from '@moreillon/vue_loader'
import Modal from '@moreillon/vue_modal'

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
  name: 'Administrators',
  props: {
    group: Object,
    current_user_is_admin_of_group: Boolean,
  },
  data(){
    return {
      administrators: [],
      administrator_modal_open: false,
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
    this.get_administrators_of_group()
  },
  methods: {
    get_administrators_of_group(){
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/administrators`)
      .then( ({data}) => {
        this.administrators = data
        if(this.current_user_is_admin) this.$emit('user_is_admin')
      })
       .catch(error => {
         alert(`System error`)
         console.error(error)
       })
    },

    make_user_administrator_of_group(user){
      if(!confirm(`Make user ${user.properties.display_name} admin of group ${this.group.properties.name}?`)) return

      const user_id = user.identity.low || user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/administrators/${user_id}`

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

      const user_id = user.identity.low || user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/administrators/${user_id}`

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
