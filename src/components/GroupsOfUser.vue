<template lang="html">
  <v-data-table
    :items="groups"
    :headers="headers"
    :loading="loading"
    :options.sync="options"
    :server-items-length="total">

    <template v-slot:item.name="{ item }">
      <router-link :to="{name: 'Group', params: {group_id: item._id}}">
        {{item.name}}
      </router-link>
    </template>

    <template v-slot:item.restricted="{ item }">
      <v-icon v-if="item.restricted">mdi-lock</v-icon>
      <!-- <v-icon v-else>mdi-lock-open</v-icon> -->
    </template>

    <template v-slot:item.official="{ item }">
      <v-icon v-if="item.official">mdi-check</v-icon>
      <!-- <v-icon v-else>mdi-close</v-icon> -->
    </template>


  </v-data-table>
</template>

<script>
export default {
  name: 'GroupsOfUser',
  props: {
    as: {type: String, default: () => 'member'},
    shallow: Boolean,
  },
  data(){
    return {
      loading: false,
      groups: [],
      total: 0,
      options: {},
      headers: [
        {value: 'name', text: 'Name'},
        {value: 'official', text: 'Official'},
        {value: 'restricted', text: 'Restricted'},
      ]
    }
  },
  mounted(){
    this.get_groups()
  },
  watch: {
    shallow(){
      this.get_groups()
    },
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
        start_index: (page-1) * itemsPerPage,
        shallow: this.shallow,
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