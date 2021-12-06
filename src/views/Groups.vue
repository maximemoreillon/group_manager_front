<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>Groups</v-toolbar-title>
      <v-spacer/>
      <v-btn
        exact
        :to="{name: 'CreateGroup'}">
        Create group
      </v-btn>
    </v-toolbar>
    <v-divider/>

    <v-card-text>
      Groups come here
    </v-card-text>

  </v-card>
</template>

<script>

  export default {
    name: 'Home',
  }
</script>
