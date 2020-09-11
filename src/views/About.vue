<template>
  <div class="about">
    <h1>About</h1>
    <p>Group Manager, Maxime MOREILLON</p>
    <p>Version: v{{version}}</p>
    <p>API URL: {{api_url}}</p>

  </div>
</template>

<script>
import pjson from '@/../package.json'

export default {
  name: 'Search',
  components: {

  },
  data(){
    return {
      api_url: process.env.VUE_APP_GROUP_MANAGER_API_URL,
      version: pjson.version
    }
  },


}
</script>

<style scoped>


</style>
