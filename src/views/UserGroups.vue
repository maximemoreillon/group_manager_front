<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>User groups</v-toolbar-title>
    </v-toolbar>
    <v-divider/>
    <v-card-text>
      <v-data-table
        :items="groups"
        :headers="headers"
        :loading="loading"
        @click:row="$router.push({name: 'Group', params: {group_id: $event._id}})">

        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Groups</v-toolbar-title>
            <v-spacer/>

            <!-- <v-btn
              class="mx-2"
              :to="{name: 'create_group', query: {parent: group_id}}"
              dark>
              <v-icon>mdi-account-multiple-plus</v-icon>
              <span class="ml-2">Create subgroup</span>
            </v-btn> -->

          </v-toolbar>
          <v-divider/>
        </template>
      </v-data-table>
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
      loading: false,
      groups: [],
      headers: [
        {value: 'name', text: 'Name'}
      ]
    }
  },
  mounted(){
    this.get_groups()
  },
  methods: {
    get_groups(){
      this.loading = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/users/${this.user_id}/groups`
      this.axios.get(url)
      .then( ({data}) => {
        this.groups = data
      })
      .catch( error => {
        console.error(error)
      })
      .finally( () => { this.loading = false})
    },
  },
  computed: {
    user_id(){
      return this.$route.params.user_id
    }
  }
}
</script>
