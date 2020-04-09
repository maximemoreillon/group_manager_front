<template>
  <div id="app">
    <AppTemplate
      applicationName="Group management microservice"
      v-bind:navigation="navigation"/>
  </div>
</template>

<script>
import AppTemplate from '@moreillon/vue_application_template_flex'

export default {
  name: 'app',
  components: {
    AppTemplate
  },
  data(){
    return{
      navigation : [
        {route: '/', label: 'Groups', icon: 'account-multiple'},
        {route: '/search', label: 'Search', icon: 'account-search'},
      ]
    }
  }
}
</script>

<style>

</style>
