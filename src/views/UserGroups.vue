<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>User groups</v-toolbar-title>
    </v-toolbar>
    <v-divider/>
  </v-card>
</template>

<script>
export default {
  name: 'Home',
  watch:{
    user_id(){
      console.log('User ID changed')
    }
  },
  computed: {
    user_id(){
      return this.$route.params.user_id
    }
  }
}
</script>
