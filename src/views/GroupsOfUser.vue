<template>
  <div class="groups">

    <template v-if="user">
      <h1 v-if="user">
        Groups of {{user.properties.display_name}}
      </h1>
      <p v-if="user_profile_url">
        <a :href="user_profile_url">
          Go to {{user.properties.display_name}}'s profile
        </a>
      </p>
    </template>
    <h1 v-else>Groups</h1>



    <h2 class="">As member ({{groups.length}})</h2>
    <template v-if="!groups.loading">
      <template v-if="groups.length > 0">

        <h3>Official groups ({{official_groups(groups).length}})</h3>

        <GroupPreview
          v-for="(group, index) in official_groups(groups)"
          v-bind:key="`official_${index}`"
          v-bind:group="group">

          <button
            type="button"
            v-if="current_user_is_admin"
            v-on:click.stop="remove_user_from_group(group)" >
            <font-awesome-icon icon="sign-out-alt" />
            <span>Remove</span>
          </button>

        </GroupPreview>

        <h3>Non-official groups ({{non_official_groups(groups).length}})</h3>
        <GroupPreview
          v-for="(group, index) in non_official_groups(groups)"
          v-bind:key="`nonofficial_${index}`"
          v-bind:group="group">

          <button
            type="button"
            v-if="current_user_is_admin"
            v-on:click.stop="remove_user_from_group(group)" >
            <font-awesome-icon icon="sign-out-alt" />
            <span>Remove</span>
          </button>

        </GroupPreview>

      </template>
      <div class="" v-else>No groups</div>
    </template>
    <Loader v-if="groups.loading" message="Loading"/>
    <div class="error" v-if="groups.error"> {{error}} </div>


    <!-- Groups administrated by user -->
    <h2 class="">As administrator ({{groups_administrated_by_user.length}})</h2>
    <template v-if="!groups_administrated_by_user.loading">
      <template class="" v-if="groups_administrated_by_user.length > 0">

        <h3>Official groups ({{official_groups(groups_administrated_by_user).length}})</h3>
        <GroupPreview
          v-for="(group, index) in official_groups(groups_administrated_by_user)"
          v-bind:key="`administrated_official_${index}`"
          v-bind:group="group">
          <button
            type="button"
            v-if="current_user_is_admin"
            v-on:click.stop="remove_user_from_administrators(group)">
            <font-awesome-icon icon="sign-out-alt"/>
            <span>Remove from admins</span>
          </button>
        </GroupPreview>

        <h3>User-created groups ({{non_official_groups(groups_administrated_by_user).length}})</h3>
        <GroupPreview
          v-for="(group, index) in non_official_groups(groups_administrated_by_user)"
          v-bind:key="`administrated_nonofficial_${index}`"
          v-bind:group="group">
          <button
            type="button"
            v-if="current_user_is_admin"
            v-on:click.stop="remove_user_from_administrators(group)">
            <font-awesome-icon icon="sign-out-alt"/>
            <span>Remove</span>
          </button>
        </GroupPreview>

      </template>
      <div class="" v-else>No groups</div>
    </template>
    <Loader v-if="groups_administrated_by_user.loading" message="Loading"/>
    <div class="error" v-if="groups_administrated_by_user.error">{{error}}</div>

  </div>
</template>

<script>
import Loader from '@moreillon/vue_loader'

import GroupPreview from '@/components/GroupPreview.vue'

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
    FontAwesomeIcon,
    Loader,
    GroupPreview,

  },
  data(){
    return {
      user: null,
      groups: [],
      error: null,

      groups_administrated_by_user: [],


    }
  },


  beforeRouteUpdate (to, from, next) {
    next()
    this.$nextTick().then(() => {
      this.get_user()
      this.get_groups_of_user()
      this.get_groups_administrated_by_user()
    })
  },

  mounted(){
    this.get_user()
    this.get_groups_of_user()
    this.get_groups_administrated_by_user()
  },
  methods: {

    get_user(){
      // simply used to show the user's name on the page title
      const user_id = this.$route.params.member_id
        || this.$route.params.user_id
        || this.$route.query.id
        || 'self'

      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/members/${user_id}`
      this.axios.get(url)
      .then(response => {
        let record = response.data[0]
        this.user = record._fields[record._fieldLookup['user']]
      })
      .catch(error => alert(error))

    },

    get_groups_of_user(){

      let user_id = this.$route.query.id
        || this.$route.query.user_id
        || this.$route.params.user_id
        || 'self'

      let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/members/${user_id}/groups`

      this.$set(this.groups,'loading',true)

      this.axios.get(url)
      .then(response => {
        this.groups = []
        response.data.forEach((record) => {
          this.groups.push(record._fields[record._fieldLookup['group']])
        });
      })
      .catch( (error) => {

        if(error.response) console.log(error.response.data)
        else console.log(error)

        this.$set(this.groups,'error','Error loading groups')
      })
      .finally( () => {this.$set(this.groups,'loading',false)})
    },

    get_groups_administrated_by_user(){

      let user_id = this.$route.query.id
        || this.$route.query.user_id
        || this.$route.params.user_id
        || 'self'

      let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/administrators/${user_id}/groups`

      this.$set(this.groups_administrated_by_user,'loading',true)

      this.axios.get(url)
      .then(response => {
        this.groups_administrated_by_user = []
        response.data.forEach((record) => {
          this.groups_administrated_by_user.push(record._fields[record._fieldLookup['group']])
        });
      })
      .catch( () => {this.$set(this.groups,'error','Error loading groups')})
      .finally( () => {this.$set(this.groups_administrated_by_user,'loading',false)})
    },
    official_groups(groups){
      return groups.filter((group) => {
        return group.properties.official
      })
    },
    non_official_groups(groups) {
      return groups.filter((group) => {
        return !group.properties.official
      })
    },
    remove_user_from_group(group){
      if(!confirm(`Remove user ${this.user.properties.display_name} from group ${group.properties.name}?`)) return

      const group_id = group.identity.low || group.identity
      const user_id = this.user.identity.low || this.user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/members/${user_id}`

      this.axios.delete(url)
      .then( () => {
        this.get_groups_of_user()
      })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })
    },
    remove_user_from_administrators(group){
      if(!confirm(`Remove ${this.user.properties.display_name} from administrators of ${group.properties.name}?`)) return

      const group_id = group.identity.low || group.identity
      const user_id = this.user.identity.low || this.user.identity
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups/${group_id}/administrators/${user_id}`

      this.axios.delete(url)
      .then( () => {
        this.get_groups_administrated_by_user()
      })
      .catch(error => {
        alert(`System error`)
        console.error(error)
      })


    },

  },
  computed: {
    user_id(){
      return this.$route.params.user_id
    },
    current_user_id(){
      return this.$store.state.current_user.identity.low
        || this.$store.state.current_user.identity
    },
    current_user_is_admin(){
      if(!this.$store.state.current_user) return false
      return this.$store.state.current_user.properties.isAdmin
    },
    user_is_current_user(){
      // If ID not specified in query, then user is automatically current user
      if(!this.user_id || this.user_id === 'self') return true
      // If an ID is specified but current user cannot be identified, then user might not be current user
      if(!this.$store.state.current_user) return false
      return this.current_user_id === this.user_id
    },
    user_profile_url(){
      if(!process.env.VUE_APP_USER_PROFILE_URL) return null

      return process.env.VUE_APP_USER_PROFILE_URL.replace(':user_id',this.user_id)

    },

  }
}
</script>

<style scoped>

/* duplicate of group */
.title {
  font-size: 200%;
}


.user_picker, .group_picker{
  height: 250px;
}



.group:hover{
  //border-color: #c00000;
}

a {
  color: currentColor;
}

a:hover {
  color: #c00000;
}

</style>
