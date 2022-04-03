<template>
  <v-data-table
    :items="groups"
    :headers="headers"
    :loading="loading"
    :options.sync="options"
    :server-items-length="total"
    :items-per-page="50"
    :footer-props="footerProps"
    disable-sort
    disable-filtering>

    <template v-slot:top>
      <v-row align="center">
        <v-spacer />
        <v-col cols="auto">
          <v-switch
            v-model="options.shallow"
            label="Direct only"/>
        </v-col>
        <v-col cols="auto">
          <AddGroupDialog
            :as="group_type"
            @groupAdd="add_group($event)"/>
        </v-col>
      </v-row>
    </template>

    <template v-slot:item.image="{ item }">
      <v-img
        v-if="item.avatar_src"
        contain
        width="2.5em"
        height="2.5em"
        :src="item.avatar_src" />
      <v-icon
        size="2.5em"
        v-else>
        mdi-account-multiple
      </v-icon>
    </template>


    <template v-slot:item.name="{ item }">
      <router-link :to="{name: 'Group', params: {group_id: item._id}}">
        {{item.name}}
      </router-link>
    </template>

    <template v-slot:item.restricted="{ item }">
      <v-icon v-if="item.restricted">mdi-check</v-icon>
      <!-- <v-icon v-else>mdi-lock-open</v-icon> -->
    </template>

    <template v-slot:item.official="{ item }">
      <v-icon v-if="item.official">mdi-check</v-icon>
      <!-- <v-icon v-else>mdi-close</v-icon> -->
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
    group_type: String, // 'child' or 'parent'
  },
  data(){
    return {
      loading: false,
      groups: [],
      total: 0,
      options: { shallow: true },
      footerProps: {'items-per-page-options': [50, 100, 500, -1]},
      base_headers: [
        {value: 'image', text: 'Logo'},
        {value: 'name', text: 'Name'},
        {value: 'official', text: 'Official'},
        {value: 'restricted', text: 'Restricted'},
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
        // WARNING: DOUBLE QUERY WHEN CHANGING SHALLOW
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

      const { itemsPerPage, page, shallow } = this.options
      const params = {
        batch_size: itemsPerPage,
        start_index: (page-1) * itemsPerPage,
        shallow: shallow ? true : undefined, // do not send if not true
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
