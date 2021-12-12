<template>
  <div class="parent_groups">
    <h2 class="">Parent Groups</h2>
    <div class="" v-if="parent_groups.error">{{parent_groups.error}}</div>
    <Loader v-else-if="parent_groups.loading">Loading parent groups</Loader>
    <template v-else>

      <div class="toolbar">
        <input
          type="checkbox"
          v-model="direct_parents_only"
          @change="get_parent_groups_of_group()">
        <label>Show only direct parents</label>

        <div class="spacer"/>
        <template v-if="current_user_is_admin_of_group || current_user_is_admin">
          <button
            type="button"
            v-on:click="parent_group_modal_open = true" >
            <font-awesome-icon icon="plus" />
            <span>Add parent group</span>
          </button>
        </template>

      </div>


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

    <Modal
      :open="parent_group_modal_open"
      @close="parent_group_modal_open=false">
      <h2>Add current group to parent group</h2>
      <div class="modal_picker_wrapper">
        <GroupPicker
          v-if="parent_group_modal_open"
          :usersWithNoGroup="false"
          class="modal_picker"
          @selection="add_child_group_to_parent_group(group, $event)"/>
      </div>
    </Modal>
  </div>
</template>

<script>
import GroupPreview from '@/components/GroupPreview.vue'
import Loader from '@moreillon/vue_loader'
import Modal from '@moreillon/vue_modal'
import GroupPicker from '@moreillon/vue_group_picker'

import IdUtils from '@/mixins/IdUtils.js'

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
  name: 'SubGroups',
  props: {
    group: Object,
    current_user_is_admin_of_group: Boolean,
  },
  mixins: [ IdUtils ],

  data(){
    return {
      loading: false,
      error: null,
      direct_parents_only: true,
      parent_groups: [],
      parent_group_modal_open: false,
    }
  },
  components: {
    GroupPreview,
    Loader,
    Modal,
    GroupPicker,
    FontAwesomeIcon,

  },
  mounted(){
    this.get_parent_groups_of_group()
  },
  methods: {
    get_parent_groups_of_group(){
      this.$set(this.parent_groups,'loading',true)
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/parent_groups`
      const params = {direct: this.direct_parents_only}
      this.axios.get(url, {params})
      .then( ({data}) => { this.parent_groups = data })
      .catch( () => this.$set(this.parent_groups,'error','Error'))
      .finally(() => this.$set(this.parent_groups,'loading',false))
    },
    add_child_group_to_parent_group(child_group, parent_group){
      if(!confirm(`Add ${child_group.properties.name} to ${parent_group.properties.name}?`)) return

      const parent_group_id = this.get_id_of_item(parent_group)
      const child_group_id = this.get_id_of_item(child_group)

      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${parent_group_id}/groups`
      const body = {group_id: child_group_id}
      this.axios.post(url, body)
      .then( () => {
        this.parent_group_modal_open=false
        this.get_parent_groups_of_group()
      })
      .catch(error => {
        alert(`Invalid operation`)
        console.error(error)
      })
    },
    remove_child_group_from_parent_group(child_group, parent_group){
      if(!confirm(`Remove ${child_group.properties.name} from ${parent_group.properties.name}?`)) return

      const parent_group_id = this.get_id_of_item(parent_group)
      const child_group_id = this.get_id_of_item(child_group)

      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${parent_group_id}/groups/${child_group_id}`
      this.axios.delete(url)
      .then( () => {
        this.get_parent_groups_of_group()
      })
      .catch(error => {
        alert(`Invalid operation`)
        console.error(error)
      })
    },
  },
  computed: {
    group_id(){
      return this.$route.params.group_id
    },
    current_user_is_admin(){
      if(!this.$store.state.current_user) return false
      return this.$store.state.current_user.properties.isAdmin
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
