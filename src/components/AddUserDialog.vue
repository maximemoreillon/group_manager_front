<template>
  <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="black"
          dark
          v-bind="attrs"
          v-on="on" >
          <v-icon>mdi-account-plus</v-icon>
          <span class="ml-2">Add user</span>
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          Add a user
        </v-card-title>

        <v-card-text>
          <UserPicker
            @selection="user_selected($event)"/>


        </v-card-text>


        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

</template>

<script>
import UserPicker from '@moreillon/vue_user_picker'

export default {
  name: 'AddUserDialog',
  components: {
    UserPicker
  },
  data(){
    return {
      dialog: false,
      users: [],
      headers: [
        {text: 'Username', value: 'username'},
      ],
    }
  },
  mounted(){
    //this.get_users()
  },
  methods: {
    get_users(){
      const url = `${process.env.VUE_APP_USER_MANAGER_API_URL}/v2/users/`
      this.axios.get(url)
      .then( ({data}) => {
        this.users = data

      })
      .catch( error => {
        console.error(error)
      })
    },
    user_selected(user){
      const _id = user._id || user.properties._id
      this.$emit('userAdd', {_id})
      this.dialog = false
    },
  }
}
</script>

<style lang="css" scoped>
</style>
