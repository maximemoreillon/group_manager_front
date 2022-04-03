<template>
  <v-data-table
    :items="groups"
    :headers="headers"
    :loading="loading"
    :options.sync="options"
    :server-items-length="total">

    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Parent groups</v-toolbar-title>
        <v-spacer/>
        <AddGroupDialog
          @groupAdd="add_group($event)"/>
      </v-toolbar>
    </template>

    <template v-slot:item.name="{ item }">
      <router-link :to="{name: 'Group', params: {group_id: item._id}}">
        {{item.name}}
      </router-link>
    </template>

    <template v-slot:item.delete="{ item }">
      <v-btn
        icon
        @click="remove_group(item)"
        color="#c00000"
        dark>
        <v-icon>mdi-account-multiple-remove</v-icon>
      </v-btn>
    </template>

  </v-data-table>

</template>

<script>
import AddGroupDialog from '@/components/AddGroupDialog.vue'

export default {
  name: 'SubGroups',
  components: {
    AddGroupDialog
  },
  props: {
    currentUserHasAdminRights: Boolean,

  },
  data(){
    return {
      loading: false,
      groups: [],
      total: 0,
      options: {},
      base_headers: [
        {value: 'name', text: 'Name'},
      ],
      admin_headers: [
        {value: 'delete', text: 'Delete'},
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
      this.groups = []
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/parents`
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
        .finally( () => { this.loading = false})
    },
    add_group(group){
      if(!this.currentUserHasAdminRights) return alert(`This action can only be performed by group administrators`)
      const group_id = group._id || group.properties._id // for old picker
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${group_id}/groups`
      const body = {group_id: this.group_id}
      this.axios.post(url, body)
      .then( () => {
        this.$emit("groupsChanged")
      })
      .catch( error => {
        console.error(error)
      })
    },
    remove_group(group){
      if(!this.currentUserHasAdminRights) return alert(`This action can only be performed by group administrators`)
      if(!confirm(`Remove group ${group.name}?`)) return
      const group_id = group._id
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${group_id}/groups/${this.group_id}`
      this.axios.delete(url)
      .then( () => {
        this.$emit("groupsChanged")
      })
      .catch( error => {
        console.error(error)
      })
    }
  },
  computed: {
    group_id(){
      return this.$route.params.group_id
    },
    headers(){
      if(this.currentUserHasAdminRights) return [...this.base_headers, ...this.admin_headers]
      else return this.base_headers
    }
  }
}
</script>

<style lang="css" scoped>
</style>
