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
          <v-data-table
            :items="groups"
            :headers="headers"
            :loading="groups_loading"
            @click:row="$router.push({name: 'Group', params: {group_id: $event._id}})">

            <template v-slot:top>

              <v-toolbar flat>
                <v-toolbar-title>As member</v-toolbar-title>
              </v-toolbar>

            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

    </v-card-text>

    <v-card-text>
      <v-card outlined>
        <v-card-text>
          <v-data-table
            :items="administrated_groups"
            :headers="headers"
            :loading="administrated_groups_loading"
            @click:row="$router.push({name: 'Group', params: {group_id: $event._id}})">

            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>As administrator</v-toolbar-title>
              </v-toolbar>

            </template>
          </v-data-table>

        </v-card-text>
      </v-card>


    </v-card-text>

  </v-card>
</template>

<script>
export default {
  name: 'UserGroups',
  watch:{
    user_id(){
      this.get_groups()
    }
  },
  data(){
    return {

      groups_loading: false,
      groups: [],
      deep: false,

      administrated_groups: [],
      administrated_groups_loading: false,

      user: null,
      user_loading: false,

      headers: [
        {value: 'name', text: 'Name'}
      ]
    }
  },
  mounted(){
    this.get_user()
    this.get_groups()
    this.get_administrated_groups()
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
    get_groups(){
      this.groups_loading = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/users/${this.user_id}/groups`
      this.axios.get(url)
      .then( ({data}) => {
        this.groups = data.items
      })
      .catch( error => {
        console.error(error)
      })
      .finally( () => { this.groups_loading = false})
    },
    get_administrated_groups(){
      this.administrated_groups_loading = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/administrators/${this.user_id}/groups`
      this.axios.get(url)
      .then( ({data}) => {
        this.administrated_groups = data.items
      })
      .catch( error => {
        console.error(error)
      })
      .finally( () => { this.administrated_groups_loading = false})
    },
  },
  computed: {
    user_id(){
      return this.$route.params.user_id
    }
  }
}
</script>
