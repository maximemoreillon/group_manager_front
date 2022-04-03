<template>
  <v-dialog
    width="90vw"
    v-model="dialog">

      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="black"
          dark
          v-bind="attrs"
          v-on="on" >
          <v-icon>mdi-account-plus</v-icon>
          <span class="ml-2">Add {{as || 'user'}}</span>
        </v-btn>
      </template>

      <v-card>
        <v-toolbar flat>
          <v-row align="center">
            <v-col cols="auto">
              <v-toolbar-title>Add {{as || 'user'}}</v-toolbar-title>
            </v-col>

            <v-spacer />
            <v-col cols="auto">
              <v-btn
                @click="dialog = false">
                Cancel
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn
                dark
                @click="add_selected_users()">
                Add selected users
              </v-btn>
            </v-col>
          </v-row>
        </v-toolbar>
        <v-divider />

        <v-card-text class="mt-3">
          <UserPicker
            class="picker_container"
            @selection="add_user($event)"/>
        </v-card-text>

        <v-card-text>
          <v-card
            outlined
            min-height="20vh">
            <v-card-title>Selected users</v-card-title>
            <v-card-text>

              <v-row>
                <v-col
                  cols="auto"
                  v-for="(user, index) in selected_users"
                  :key="user._id">
                  <v-chip
                    close
                    @click:close="remove_user(index)">
                    {{user.display_name || user.username}}
                  </v-chip>
                </v-col>
              </v-row>

              <!-- <v-list dense>
                <v-list-item
                  v-for="(user, index) in selected_users"
                  :key="user._id">

                  <v-list-item-content>
                    {{user.display_name || user.username}}
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      small
                      icon
                      @click="remove_user(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-list-item-action>

                </v-list-item>
              </v-list> -->

            </v-card-text>
          </v-card>
        </v-card-text>

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
  props: {
    as: String,
  },
  data(){
    return {
      dialog: false,
      selected_users: [],
    }
  },

  watch: {
    dialog(){
      this.selected_users = []
    }
  },
  methods: {
    add_user(user){
      if(this.selected_users.some(({_id}) => _id === user._id)) {
        return alert('Duplicates not allowed')
      }
      this.selected_users.push(user)
    },
    add_selected_users(){
      const url = `${process.env.VUE_APP_GROUP_MANAGER_API_URL}/v3/groups/${this.group_id}/${this.as}`
      const body = {user_ids: this.selected_users.map(({_id}) => _id)}
      this.axios.post(url, body)
      .then( () => {
        this.$emit('usersChanged')
      })
      .catch( error => {
        console.error(error)
      })
    },
    remove_user(index){
      this.selected_users.splice(index,1)
    }
  },
  computed: {
    group_id(){
      return this.$route.params.group_id
    },
  }
}
</script>

<style lang="css" scoped>
.picker_container {
  max-height: 40vh;
}

</style>
