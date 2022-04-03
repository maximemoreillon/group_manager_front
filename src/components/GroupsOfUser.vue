<template lang="html">
  <v-data-table
    :items="groups"
    :headers="headers"
    :loading="loading"
    :options.sync="options"
    :server-items-length="total"
    @click:row="$router.push({name: 'Group', params: {group_id: $event._id}})">

    <!-- <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>As {{as}}</v-toolbar-title>
      </v-toolbar>
    </template> -->

  </v-data-table>
</template>

<script>
export default {
  name: 'GroupsOfUser',
  props: {
    as: {type: String, default: () => 'member'},
  },
  data(){
    return {
      loading: false,
      groups: [],
      total: 0,
      options: {},
      headers: [
        {value: 'name', text: 'Name'}
      ]
    }
  },
  mounted(){
    this.get_groups()
  },
  watch: {
    options: {
      handler () {
        this.get_groups()
      },
      deep: true,
    },
  },
  methods: {
    get_groups(){
      this.loading = true
      // NOTE: adding 's' after 'as'
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/${this.as}s/${this.user_id}/groups`

      const { itemsPerPage, page } = this.options
      const params = {
        batch_size: itemsPerPage,
        start_index: (page-1) * itemsPerPage
      }

      this.axios.get(url, {params})
      .then( ({data: {count, items}}) => {
        this.total = count
        this.groups = items
      })
      .catch( error => {
        console.error(error)
      })
      .finally( () => { this.loading = false })
    },
  },
  computed: {
    user_id(){
      return this.$route.params.user_id
    }
  }
}
</script>

<style lang="css" scoped>
</style>
