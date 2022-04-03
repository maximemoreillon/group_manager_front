<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title
        v-if="user">
        {{user.display_name}}
      </v-toolbar-title>
      <v-toolbar-title v-else>
        <v-progress-circular indeterminate/>
      </v-toolbar-title>
      <v-spacer/>
      <v-spacer/>
      <v-btn
        exact
        :to="{name: 'CreateGroup'}">
        <v-icon>mdi-account-multiple-plus</v-icon>
        <span class="ml-2">Create group</span>
      </v-btn>
    </v-toolbar>
    <v-divider/>

    <v-card-text>
      <v-card outlined>
        <v-card-text>
          <GroupsOfUser as="member" />

        </v-card-text>
      </v-card>

    </v-card-text>

    <v-card-text>
      <v-card outlined>
        <v-card-text>
          <GroupsOfUser as="administrator" />
        </v-card-text>
      </v-card>


    </v-card-text>

  </v-card>
</template>

<script>
import GroupsOfUser from '@/components/GroupsOfUser.vue'

export default {
  name: 'UserGroups',
  watch:{
    user_id(){
      this.get_groups()
    }
  },
  components: {
    GroupsOfUser
  },
  data(){
    return {
      user: null,
      user_loading: false,

    }
  },
  mounted(){
    this.get_user()

  },
  methods: {
    get_user(){
      this.user_loading = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/users/${this.user_id}`
      this.axios.get(url)
      .then( ({data}) => {
        this.user = data
      })
      .catch( error => {
        console.error(error)
      })
      .finally( () => { this.user_loading = false})
    },

  },
  computed: {
    user_id(){
      return this.$route.params.user_id
    }
  }
}
</script>
