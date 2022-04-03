<template>
  <v-card
    max-width="60em"
    class="mx-auto">
    <v-toolbar flat>

      <v-row align="baseline">
        <v-toolbar-title
          v-if="user">
          Groups of {{user.display_name}}
        </v-toolbar-title>
        <v-toolbar-title v-else>
          <v-progress-circular indeterminate/>
        </v-toolbar-title>
        <v-spacer />
        <v-col cols="auto">
          <v-switch
            v-model="shallow"
            label="Direct only"/>
        </v-col>
        <v-col cols="auto">
          <v-btn
            exact
            :to="{name: 'CreateGroup'}">
            <v-icon>mdi-account-multiple-plus</v-icon>
            <span class="ml-2">Create group</span>
          </v-btn>
        </v-col>
      </v-row>


      <template v-slot:extension>
        <v-tabs
          v-model="tab">
          <v-tab>As member</v-tab>
          <v-tab>As administrator</v-tab>
        </v-tabs>
      </template>

    </v-toolbar>
    <v-divider/>

    <v-card-text>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <GroupsOfUser
            :shallow="shallow"
            as="member" />
        </v-tab-item>
        <v-tab-item>
          <GroupsOfUser
            :shallow="shallow"
            as="administrator" />
        </v-tab-item>
      </v-tabs-items>
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
      tab: null,
      shallow: true,

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
