<template>
  <v-card
    max-width="500"
    class="mx-auto">
    <v-toolbar flat>
      <v-toolbar-title>Group browser</v-toolbar-title>
      <v-spacer/>
      <v-btn
        exact
        :to="{name: 'CreateGroup'}">
        <v-icon>mdi-account-multiple-plus</v-icon>
        <span class="ml-2">Create group</span>
      </v-btn>
    </v-toolbar>
    <v-divider/>

    <v-card-text>
      <GroupPicker
        @selection="group_selected($event)"/>
    </v-card-text>

  </v-card>
</template>

<script>
import GroupPicker from '@moreillon/vue_group_picker'

export default {
  name: 'Groups',
  components: {
    GroupPicker
  },
  methods: {
    group_selected(group){
      const group_id = group._id || group.properties._id
      this.$router.push({name: 'Group', params: {group_id}})
    }
  }
}
</script>
