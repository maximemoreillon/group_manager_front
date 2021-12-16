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
      <v-divider/>
    </template>

    <template v-slot:item.see="{ item }">
      <v-btn
        icon
        @click="$router.push({name: 'Group', params: {group_id: item._id}})">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
    </template>

    <template v-slot:item.delete="{ item }">
      <v-btn
        icon
        @click="remove_subgroup(item)"
        color="#c00000"
        dark>
        <v-icon>mdi-delete</v-icon>
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
  data(){
    return {
      loading: false,
      subgroups: [],
      headers: [
        {value: 'name', text: 'Name'},
        {value: 'delete', text: 'Delete'},
        {value: 'see', text: 'See'},
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
    add_subgroup(subgroup){
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
      if(!confirm(`Remove user ${group.name}?`)) return
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
    }
  }
}
</script>

<style lang="css" scoped>
</style>
