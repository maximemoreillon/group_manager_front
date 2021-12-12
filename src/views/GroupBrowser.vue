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
import IdUtils from '@/mixins/IdUtils.js'

export default {
  name: 'Group',
  components: {
    GroupPicker,
  },
  data(){
    return {
    }
  },
  mixins: [ IdUtils ],
  methods: {
    see_group(group) {
      const group_id = this.get_id_of_item(group)
      this.$router.push({name: 'group', params: {group_id }})
    }
  }
}
</script>

<style scoped>



</style>
