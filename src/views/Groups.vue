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
          v-for="group in official_groups(groups)"
          v-bind:key="group.identity.low"
          v-bind:group="group"/>

        <h3>Non-official groups ({{non_official_groups(groups).length}})</h3>
        <GroupPreview
          v-for="group in non_official_groups(groups)"
          v-bind:key="group.identity.low"
          v-bind:group="group"/>

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
          v-for="group in official_groups(groups_administrated_by_user)"
          v-bind:key="`administrated_${group.identity.low}`"
          v-bind:group="group"/>

        <h3>User-created groups ({{non_official_groups(groups_administrated_by_user).length}})</h3>
        <GroupPreview
          v-for="group in non_official_groups(groups_administrated_by_user)"
          v-bind:key="`administrated_${group.identity.low}`"
          v-bind:group="group"/>

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



export default {
  name: 'Group',
  components: {
    Loader,
    GroupPreview,

  },
  data(){
    return {
      user: null,
      groups: [],
      error: null,

      groups_administrated_by_user: [],

      group_manager_api_url : process.env.VUE_APP_GROUP_MANAGER_API_URL,
      user_page_url : process.env.VUE_APP_EMPLOYEE_MANAGER_FRONT_URL,
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
      let user_id = this.$route.params.member_id
        || this.$route.params.user_id
        || this.$route.query.id
        || 'self'

      let url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/members/${user_id}`
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
    }

  },
  computed: {
    user_is_current_user(){
      let user_id = this.$route.params.user_id
      // If ID not specified in query, then user is automatically current user
      if(!user_id || user_id === 'self') return true
      // If an ID is specified but current user cannot be identified, then user might not be current user
      if(!this.$store.state.current_user) return false
      return this.$store.state.current_user.identity.low === user_id
    },
    user_profile_url(){
      if(!process.env.VUE_APP_USER_MANAGER_FRONT_URL) return null

      let user_manager_front_url = process.env.VUE_APP_USER_MANAGER_FRONT_URL
      let user_id = this.$route.params.user_id

      if(process.env.VUE_APP_USER_PROFILE_ROUTE){
        console.log(process.env.VUE_APP_USER_PROFILE_ROUTE)
        console.log(process.env.VUE_APP_USER_PROFILE_ROUTE === '')
        console.log(typeof process.env.VUE_APP_USER_PROFILE_ROUTE)

        let route = process.env.VUE_APP_USER_PROFILE_ROUTE.replace(':user_id',user_id)
        return `${user_manager_front_url}${route}`
      }
      else {
        return `${user_manager_front_url}/users/${user_id}`
      }


    }

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
