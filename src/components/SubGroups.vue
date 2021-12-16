<template>
  <v-data-table
    :items="subgroups"
    :headers="headers"
    :loading="loading"
    @click:row="$router.push({name: 'Group', params: {group_id: $event._id}})">

    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Subgroups</v-toolbar-title>
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

</template>

<script>
export default {
  name: 'SubGroups',
  data(){
    return {
      loading: false,
      subgroups: [],
      headers: [
        {value: 'name', text: 'Name'}
      ]

    }
  },
  mounted(){
    this.get_subgroups()
  },
  methods: {
    get_subgroups(){
      this.loading = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/groups`
      this.axios.get(url)
      .then( ({data}) => {
        this.subgroups = data
      })
      .catch( error => {
        console.error(error)
      })
      .finally( () => { this.loading = false})
    },
  },
  computed: {
    group_id(){
      return this.$route.params.group_id
    }
  }
}
</script>

<style lang="css" scoped>
</style>
