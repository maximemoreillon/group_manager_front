<template>
  <div class="group_browser">

    <h1 >Group browser</h1>

    <GroupPicker
      class="group_picker"
      :usersWithNoGroup="false"
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
    }
  },
  methods: {
    see_group(event) {
      const group_id = event.identity.low || event.identity
      this.$router.push({name: 'group', params: {group_id }})
    }
  }
}
</script>

<style scoped>



</style>
