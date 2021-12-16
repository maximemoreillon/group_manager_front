<template>
  <v-data-table
    :items="members"
    :headers="headers"
    @click:row="$router.push({name: 'UserGroups', params: {user_id: $event._id}})">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>members</v-toolbar-title>
        <v-spacer/>
        <AddUserDialog
          @userAdd="$emit('userAdd',$event)"/>
      </v-toolbar>
      <v-divider/>
    </template>

    <template v-slot:item.admin="{ item }">
      <v-checkbox
        v-model="item.admin">
      </v-checkbox>
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
        {value: 'username', text: 'Username'}
      ]

    }
  },
  mounted(){
    this.get_subgroups()
  },
  methods: {
    get_subgroups(){
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
