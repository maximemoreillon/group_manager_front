<template>
  <div class="groups">

    <h1 class="" >
      Groups <span v-if="user">Of {{user.properties.name_kanji}}</span>
    </h1>


    <h2 class="">Groups ({{groups.length}})</h2>
    <template v-if="!groups.loading">
      <div v-if="groups.length > 0">
        <GroupPreview
        v-for="group in groups"
        v-bind:key="group.identity.low"
        v-bind:group="group"/>
      </div>
      <div class="" v-else>No groups</div>
    </template>
    <Loader v-if="groups.loading" message="Loading"/>
    <div class="error" v-if="groups.error"> {{error}} </div>


    <!-- Groups administrated by user -->
    <h2 class="">Administrated groups ({{groups_administrated_by_user.length}})</h2>
    <template v-if="!groups_administrated_by_user.loading">
      <div class="" v-if="groups_administrated_by_user.length > 0">
        <GroupPreview
        v-for="group in groups_administrated_by_user"
        v-bind:key="group.identity.low"
        v-bind:group="group"/>
      </div>
      <div class="" v-else>No groups</div>
    </template>
    <Loader v-if="groups_administrated_by_user.loading" message="Loading"/>
    <div class="error" v-if="groups_administrated_by_user.error">{{error}}</div>


    <!-- Options to create or join a group -->
    <template v-if="user_is_current_user">

      <!-- Join a group -->
      <div class="">
        <h2 class="">
          Join an existing group
        </h2>

        <div class="group_picker_wrapper">
          <GroupPicker
            v-bind:apiUrl="group_picker_url"
            v-on:selection="join_group($event)"
            :userPageUrl="'http://172.16.98.151:31097/'"
            groupPageUrl="group"/>
        </div>

      </div>

      <!-- Creating a group -->
      <div class="">
        <h2 class="">
          Create a new group
        </h2>
        <form class="" v-on:submit.prevent="create_group()">
          <input type="text" ref="new_group_name" placeholder="Group name">
          <input type="submit">
        </form>
      </div>
    </template>





  </div>
</template>

<script>
import Loader from '@moreillon/vue_loader'
import GroupPicker from '@moreillon/vue_group_picker'
import GroupPreview from '@/components/GroupPreview.vue'

export default {
  name: 'Group',
  components: {
    Loader,
    GroupPicker,
    GroupPreview,
  },
  data(){
    return {
      user: null,
      current_user: null,
      groups: [],

      groups_administrated_by_user: [],
    }
  },
  mounted(){
    this.get_current_user()
    this.get_user()

    this.get_groups_of_user()
    this.get_groups_administrated_by_user()

  },
  methods: {
    get_current_user(){
      this.axios.get(`${process.env.VUE_APP_AUTHENTICATION_MANAGER_URL}/whoami`)
      .then(response => {
        this.current_user = response.data
      })
      .catch(error => alert(error))
    },
    get_user(){
      // simply used to show the user's name on the page title
      if(this.$route.query.id){
        // Todo: stop using employee manager
        this.axios.get(`${process.env.VUE_APP_EMPLOYEE_MANAGER_URL}/employee`, {
          params: { user_id: this.$route.query.id }
        })
        .then(response => {

          this.user = response.data

          // passwords should not be messed with
          delete this.user.properties.password_hashed

        })
        .catch(error => alert(error))
      }
    },

    get_groups_of_user(){
      this.$set(this.groups,'loading',true)
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups_of_user`, {
        params: {id: this.$route.query.id}
      })
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
      this.$set(this.groups_administrated_by_user,'loading',true)
      this.axios.get(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups_of_administrator`, {
        params: {id: this.$route.query.id}
      })
      .then(response => {
        this.groups_administrated_by_user = []
        response.data.forEach((record) => {
          this.groups_administrated_by_user.push(record._fields[record._fieldLookup['group']])
        });
      })
      .catch( () => {this.$set(this.groups,'error','Error loading groups')})
      .finally( () => {this.$set(this.groups_administrated_by_user,'loading',false)})
    },

    create_group(){
      this.loading = true;
      this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/create_group`, {
        name: this.$refs.new_group_name.value,
      })
      .then( (response) => {
        this.$router.push({name: 'group', query: {id: response.data.identity.low}})
      })
      .catch( () => {this.error = 'Error loading groups'})
    },

    join_group(group){
      if(confirm(`Join ${group.properties.name}?`)){
        this.loading = true;
        this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/join_group`, {
          group_id: group.identity.low
        })
        .then( () => { this.get_groups_of_user() })
        .catch( () => {this.error = 'Error loading groups'})
      }

    },

  },
  computed: {
    user_is_current_user(){
      // If ID not specified in query, then user is automatically current user
      if(!this.$route.query.id) return true
      // If an ID is specified but current user cannot be identified, then user might not be current user
      if(!this.current_user) return false
      return this.current_user.identity.low === this.$route.query.id
    },
    group_picker_url(){
      return process.env.VUE_APP_GROUP_MANAGER_API_URL
    },
    group_page_url() {
      return `${process.env.VUE_APP_GROUP_MANAGER_FRONT_URL}/group`
    }
  }
}
</script>

<style scoped>

/* duplicate of group */
.title {
  font-size: 200%;
}


.group_picker_wrapper {
  height: 250px;
}



.group:hover{
  //border-color: #c00000;
}



</style>
