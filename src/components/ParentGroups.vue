<template>
  <v-data-table
    :items="parents"
    :headers="headers"
    :loading="loading">

    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Parent groups</v-toolbar-title>
        <v-spacer/>
        <AddGroupDialog
          @groupAdd="add_parent($event)"/>
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
        @click="remove_parent(item)"
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
      parents: [],
      headers: [
        {value: 'name', text: 'Name'},
        {value: 'delete', text: 'Delete'},
        {value: 'see', text: 'See'},
      ]

    }
  },
  mounted(){
    this.get_parents()
  },
  methods: {
    get_parents(){
      this.loading = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/parents`
      this.axios.get(url)
      .then( ({data}) => {
        this.parents = data
      })
      .catch( error => {
        console.error(error)
      })
      .finally( () => { this.loading = false})
    },
    add_parent(parent){
      const parent_id = parent._id || parent.properties._id // for old picker
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${parent_id}/groups`
      const body = {group_id: this.group_id}
      this.axios.post(url, body)
      .then( () => {
        this.$emit("groupsChanged")
      })
      .catch( error => {
        console.error(error)
      })
    },
    remove_parent(parent){
      if(!confirm(`Remove parent ${parent.name}?`)) return
      const parent_id = parent._id
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${parent_id}/groups/${this.group_id}`
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
