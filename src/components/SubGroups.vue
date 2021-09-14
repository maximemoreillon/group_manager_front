<template>
  <div class="subgroups">
    <h2 class="">Sub-groups</h2>
    <div class="" v-if="child_groups.error">{{child_groups.error}}</div>
    <Loader v-else-if="child_groups.loading">Loading groups</Loader>
    <template v-else>

      <div class="toolbar">
        <input
          type="checkbox"
          v-model="direct_subgroups_only"
          @change="get_child_groups_of_group()">
        <label>Show only direct subgroups</label>
        <div class="spacer"/>
        <template v-if="current_user_is_admin_of_group || current_user_is_admin">
          <button
            type="button"
            v-on:click="child_group_modal_open = true" >
            <font-awesome-icon icon="plus" />
            <span>Add child group</span>
          </button>
        </template>
      </div>

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

    <Modal
      :open="child_group_modal_open"
      @close="child_group_modal_open=false">
      <h2>Add child group to current group</h2>
      <div class="modal_picker_wrapper">
        <GroupPicker
          v-if="child_group_modal_open"
          :usersWithNoGroup="false"
          class="modal_picker"
          @selection="add_child_group_to_parent_group($event, group)"/>
      </div>
    </Modal>
  </div>
</template>

<script>
import GroupPreview from '@/components/GroupPreview.vue'
import Loader from '@moreillon/vue_loader'
import Modal from '@moreillon/vue_modal'
import GroupPicker from '@moreillon/vue_group_picker'
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
  data(){
    return {
      child_groups: [],
      child_group_modal_open: false,
      direct_subgroups_only: true,
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
    this.get_child_groups_of_group()
  },
  methods: {
    get_child_groups_of_group(){
      this.$set(this.child_groups,'loading',true)
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${this.group_id}/groups`
      const params = {direct: this.direct_subgroups_only}
      this.axios.get(url, {params})
      .then( ({data}) => { this.child_groups = data })
      .catch( (error) => {
        console.log(error)
        this.$set(this.child_groups,'error','Error')
      })
      .finally(() => this.$set(this.child_groups,'loading',false))
    },
    add_child_group_to_parent_group(child_group, parent_group){
      if(!confirm(`Add ${child_group.properties.name} to ${parent_group.properties.name}?`)) return

      const parent_group_id = parent_group.identity.low || parent_group.identity
      const child_group_id = child_group.identity.low || child_group.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${parent_group_id}/groups/${child_group_id}`

      this.axios.post(url)
      .then( () => {
        this.child_group_modal_open=false
        this.get_child_groups_of_group()
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

      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v2/groups/${parent_group_id}/groups/${child_group_id}`
      this.axios.delete(url)
      .then( () => {
        this.get_child_groups_of_group()
      })
      .catch(error => {
        alert(`Invalid operation`)
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
