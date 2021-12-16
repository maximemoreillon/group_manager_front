<template>
  <v-card
    max-width="500"
    class="mx-auto">
    <v-toolbar flat>
      <v-btn
        exact
        icon
        :to="{name: 'Groups'}" >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Create new group</v-toolbar-title>



    </v-toolbar>
    <v-divider/>

    <v-card-text>
      <v-form
        @submit.prevent="create_group()"
        ref="form"
        v-model="valid"
        lazy-validation>

        <v-row align="center">
          <v-col>
            <v-text-field
            v-model="group.name"
            label="Name"
            :rules="nameRules"
            required/>
          </v-col>
          <v-col cols="auto">
            <v-btn
              type="submit"
              :disabled="!valid" >
              <v-icon>mdi-account-multiple-plus</v-icon>
              <span>Create group</span>
            </v-btn>
          </v-col>
        </v-row>

      </v-form>
    </v-card-text>



  </v-card>
</template>

<script>
export default {
  name: 'Users',
  data(){
    return {
      error_message: null,
      group: {
        name: '',
      },
      valid: false,
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length <= 20 || 'Name must be less than 20 characters',
      ],
    }
  },

  methods: {
    create_group(){
      if(!this.$refs.form.validate()) return
      this.error_message = null

      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups`
      const parent = this.$route.query.parent
      const group = {...this.group, parent}

      this.axios.post(url, group)
      .then( ({data}) => {
        this.$router.push({name: 'Group', params: {group_id: data._id}})
      })
      .catch( error => {
        console.error(error)
        if(error.response) this.error_message = error.response.data
      })
    }
  }
}
</script>

<style>

</style>
