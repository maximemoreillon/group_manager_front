<template>
  <div class="about">
    <h1>Group Manager</h1>
    <p>Version: v{{version}}</p>
    <p>Developped by <a href="https://maximemoreillon.com">Maxime MOREILLON</a></p>
    <p>Group manager API URL: {{group_manager_api_url}}</p>
    <p>Authentication API URL: {{authentication_api_url}}</p>
    <p>user_profile_route: {{!!user_profile_route}}</p>

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
      group_manager_api_url: process.env.VUE_APP_GROUP_MANAGER_API_URL,
      authentication_api_url: process.env.VUE_APP_AUTHENTICATION_API_URL,
      user_profile_route: process.env.VUE_APP_USER_PROFILE_ROUTE,
      version: pjson.version
    }
  },


}
</script>

<style scoped>

a {
  color: currentColor;
  transition: 0.25s;
}

a:hover {
  color: #c00000;
}

</style>
