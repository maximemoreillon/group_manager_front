<template>
  <v-data-table
    :items="members"
    :headers="headers">

    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>members</v-toolbar-title>
        <v-spacer/>
        <AddUserDialog
          @userAdd="add_user($event)"/>
      </v-toolbar>
      <v-divider/>
    </template>

    <template v-slot:item.admin="{ item }">
      <v-checkbox
        v-model="item.admin">
      </v-checkbox>
    </template>

    <template v-slot:item.see="{ item }">
      <v-btn
        icon
        @click="$router.push({name: 'UserGroups', params: {user_id: item._id}})">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
    </template>

    <template v-slot:item.delete="{ item }">
      <v-btn
        icon
        @click="remove_user(item)"
        color="#c00000"
        dark>
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>

  </v-data-table>

</template>

<script>
import AddUserDialog from '@/components/AddUserDialog.vue'

export default {
  name: 'Members',
  components: {
    AddUserDialog,

  },
  data(){
    return {
      loading: false,
      members: [],
      headers: [
        {value: 'username', text: 'Username'},
        {value: 'delete', text: 'Delete'},
        {value: 'see', text: 'See'},
      ]

    }
  },
  mounted(){
    this.get_members()
  },
  methods: {
    get_members(){
      this.loading = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/members`
      this.axios.get(url)
      .then( ({data}) => {
        this.members = data
      })
      .catch( error => {
        console.error(error)
      })
      .finally( () => { this.loading = false})
    },
    add_user(user){
      const user_id = user._id || user.properties._id
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/members`
      const body = {user_id}
      this.axios.post(url, body)
      .then( () => {
        this.$emit("usersChanged")
      })
      .catch( error => {
        console.error(error)
      })
    },
    remove_user(user){
      if(!confirm(`Remove user ${user.username}?`)) return
      const user_id = user._id || user.properties._id
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/members/${user_id}`
      this.axios.delete(url)
      .then( () => {
        this.$emit("usersChanged")
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
