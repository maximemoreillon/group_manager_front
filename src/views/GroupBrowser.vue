<template>
  <div class="group_browser">

    <h1 >Group browser</h1>

    <GroupPicker
      class="group_picker"
      :usersWithNoGroup="false"
      v-bind:apiUrl="group_manager_api_url"
      @selection="see_group($event)"/>


  </div>
</template>

<script>
import GroupPicker from '@moreillon/vue_group_picker'

export default {
  name: 'Group',
  components: {
    GroupPicker,
  },
  data(){
    return {
      group_manager_api_url : process.env.VUE_APP_GROUP_MANAGER_API_URL,
    }
  },
  methods: {
    see_group(event) {
      this.$router.push({name: 'group', params: {group_id: event.identity.low}})
    }
  }
}
</script>

<style scoped>



</style>
