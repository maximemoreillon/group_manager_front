<template>
  <v-dialog
      v-model="dialog"
      width="70vw">

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
          Add user
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
    }
  },

  methods: {

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
