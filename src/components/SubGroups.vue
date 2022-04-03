<template>
  <v-data-table
    :items="subgroups"
    :headers="headers"
    :loading="loading">

    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Subgroups</v-toolbar-title>
        <v-spacer/>
        <AddGroupDialog
          @groupAdd="add_subgroup($event)"/>
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
        @click="remove_subgroup(item)"
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
      subgroups: [],
      base_headers: [
        {value: 'name', text: 'Name'},
      ],
      admin_headers: [
        {value: 'delete', text: 'Delete'},
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
        this.subgroups = data.items
      })
      .catch( error => {
        console.error(error)
      })
      .finally( () => { this.loading = false})
    },
    add_subgroup(subgroup){
      if(!this.currentUserHasAdminRights) return alert(`This action can only be performed by group administrators`)
      const subgroup_id = subgroup._id || subgroup.properties._id // for old picker
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/groups`
      const body = {group_id: subgroup_id}
      this.axios.post(url, body)
      .then( () => {
        this.$emit("groupsChanged")
      })
      .catch( error => {
        console.error(error)
      })
    },
    remove_subgroup(group){
      if(!this.currentUserHasAdminRights) return alert(`This action can only be performed by group administrators`)
      if(!confirm(`Remove group ${group.name}?`)) return
      const group_id = group._id
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/groups/${group_id}`
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
