<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>Create new group</v-toolbar-title>
    </v-toolbar>
    <v-divider/>
    <v-card-text>
      <v-form
        @submit.prevent="create_group()">

        <v-row align="center">
          <v-col>
            <v-text-field
              label="Group name"
              v-model="name" />
          </v-col>
          <v-col cols="auto">
            <v-btn
              type="submit">
              Create group
            </v-btn>
          </v-col>
        </v-row>

      </v-form>
    </v-card-text>

  </v-card>
</template>

<script>

export default {
  name: 'CreateGroup',
  data(){
    return {
      name: null,
    }
  },
  methods:{
    create_group(){

    }
  }
}


</script>
