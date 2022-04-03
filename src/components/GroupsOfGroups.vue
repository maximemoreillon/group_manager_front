<template>
  <v-data-table
    :items="groups"
    :headers="headers"
    :loading="loading"
    :options.sync="options"
    :server-items-length="total">

    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title v-if="group_type === 'parent'">Parent groups</v-toolbar-title>
        <v-toolbar-title v-else-if="group_type === 'child'">Subgroups</v-toolbar-title>
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
  name: 'GroupsOfGroups',
  components: {
    AddGroupDialog
  },
  props: {
    currentUserHasAdminRights: Boolean,
    // 'subgroup' or 'parent'
    group_type: String,

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
      // URL changes with group type
      let url
      if(this.group_type === 'parent') {
        url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/parents`
      }
      else {
        url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/groups`
      }
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
      // Changes with group type
      if(!this.currentUserHasAdminRights) return alert(`This action can only be performed by group administrators`)
      const group_id = group._id || group.properties._id // for old picker

      let url, body
      if(this.group_type === 'parent') {
        url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${group_id}/groups`
        body = {group_id: this.group_id}
      }
      else {
        url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/groups`
        body = { group_id: group._id || group.properties._id } // Support for legacy picker
      }


      this.axios.post(url, body)
      .then( () => {
        this.$emit("groupsChanged")
      })
      .catch( error => {
        console.error(error)
      })
    },
    remove_group(group){
      // Changes with group type
      if(!this.currentUserHasAdminRights) return alert(`This action can only be performed by group administrators`)
      if(!confirm(`Remove group ${group.name}?`)) return
      const group_id = group._id

      let url
      if(this.group_type === 'parent') {
        url =`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${group_id}/groups/${this.group_id}`
      }
      else {
        url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/groups/${group_id}`
      }


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
