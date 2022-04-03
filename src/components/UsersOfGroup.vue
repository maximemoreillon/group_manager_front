<template>
  <v-data-table
    :loading="loading"
    :items="members"
    :headers="headers"
    :options.sync="options"
    :server-items-length="total"
    :items-per-page="50"
    :footer-props="footerProps"
    disable-sort
    disable-filtering
    >

    <template v-slot:top>
      <v-toolbar flat>
        <v-row align="center">
          <v-spacer/>
          <v-col cols="auto">
            <MembersExcelExport
              :user_type="user_type"/>
          </v-col>
          <v-col cols="auto">
            <AddUserDialog
              :as="user_type"
              v-if="currentUserHasAdminRights"
              @usersChanged="$emit('usersChanged')"/>
          </v-col>
        </v-row>
      </v-toolbar>
    </template>

    <template v-slot:item.avatar="{ item }">
      <v-img
        v-if="item.avatar_src"
        contain
        width="2.5em"
        height="2.5em"
        :src="item.avatar_src" />
      <v-icon
        size="2.5em"
        v-else>
        mdi-account
      </v-icon>
    </template>

    <template v-slot:item.name="{ item }">
      <router-link :to="{name: 'UserGroups', params: {user_id: item._id}}">
        {{item.display_name}}
      </router-link>
    </template>

    <template v-slot:item.see="{ item }">
      <v-btn
        icon
        @click="$router.push({name: 'UserGroups', params: {user_id: item._id}})">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
    </template>

    <template v-slot:item.remove="{ item }">
      <v-btn
        icon
        @click="remove_user(item)"
        color="#c00000"
        dark>
        <v-icon>mdi-account-remove</v-icon>
      </v-btn>
    </template>

  </v-data-table>

</template>

<script>
import AddUserDialog from '@/components/AddUserDialog.vue'
import MembersExcelExport from '@/components/MembersExcelExport.vue'


export default {
  name: 'UsersOfGroup',
  components: {
    AddUserDialog,
    MembersExcelExport,
  },
  props: {
    user_type: String,
    currentUserHasAdminRights: Boolean,
  },
  data(){
    return {
      loading: false,
      members: [],
      total: 0,
      options: {},
      footerProps: {'items-per-page-options': [50, 100, 500, -1]},
      base_headers: [
        {value: 'avatar', text: ''},
        {value: 'name', text: 'Name'},
      ],
      admin_headers: [
        {value: 'remove', text: 'Remove'},
      ]

    }
  },
  watch: {
    options: {
      handler () {
        this.get_members()
      },
      deep: true,
    },
  },
  mounted(){
    this.get_members()
  },
  methods: {
    get_members(){
      this.loading = true
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/${this.user_type}`
      const { itemsPerPage, page } = this.options
      const params = {
        batch_size: itemsPerPage,
        start_index: (page-1) * itemsPerPage
      }
      this.axios.get(url, {params})
        .then( ({data: {count, items}}) => {
          this.total = count
          this.members = items
        })
        .catch( error => {
          console.error(error)
        })
        .finally( () => { this.loading = false})
    },
    add_user(user){
      if(!this.currentUserHasAdminRights) return alert(`This action can only be performed by group administrators`)
      const user_id = user._id || user.properties._id // for old picker
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/${this.user_type}`
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
      if(!this.currentUserHasAdminRights) return alert(`This action can only be performed by group administrators`)
      if(!confirm(`Remove user ${user.display_name}?`)) return
      const user_id = user._id
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/${this.user_type}/${user_id}`
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
    },
    headers(){
      let headers = this.base_headers
      if(this.members.length && this.members[0].role) headers = [...headers, {value: 'role', text: 'Role'}]
      if(this.currentUserHasAdminRights) headers = [...headers, ...this.admin_headers]
      return headers
    }
  }
}
</script>

<style lang="css" scoped>
</style>
