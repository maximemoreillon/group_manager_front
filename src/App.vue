<template>
  <AppTemplate
    :options="options"
    @user="get_user($event)">

    <template v-slot:nav>

      <router-link :to="{ name: 'groups_of_user', params: {user_id: 'self'}}">
        <AccountGroupIcon />
        <span>My groups</span>
      </router-link>



      <router-link :to="{ name: 'group_browser'}">
        <MagnifyIcon />
        <span>Group browser</span>
      </router-link>

      <router-link :to="{ name: 'create_group'}">
        <PlusIcon />
        <span>Create group</span>
      </router-link>

      <router-link :to="{ name: 'about'}">
        <InformationOutlineIcon />
        <span>About</span>
      </router-link>

    </template>

  </AppTemplate>
</template>

<script>

import AppTemplate from '@moreillon/vue_application_template'

import AccountGroupIcon from 'vue-material-design-icons/AccountGroup.vue'
import PlusIcon from 'vue-material-design-icons/Plus.vue'
import MagnifyIcon from 'vue-material-design-icons/Magnify.vue'
import InformationOutlineIcon from 'vue-material-design-icons/InformationOutline.vue'

export default {
  name: 'App',
  components: {
    AppTemplate,
    AccountGroupIcon,
    PlusIcon,
    MagnifyIcon,
    InformationOutlineIcon,

  },
  data(){
    return {
      options: {
        authenticate: true,
        title: 'Group manager',
        login_url: `${process.env.VUE_APP_AUTHENTICATION_API_URL}/login`,
        identification_url: `${process.env.VUE_APP_AUTHENTICATION_API_URL}/whoami`
      }
    }
  },
  methods: {
    get_user(user){
      this.$store.commit('set_current_user',user)
    }
  }
}
</script>

<style>
/* Those styles are app-wide */

button {
  border: none;
  background-color: transparent;
  color: black;
  cursor: pointer;
  outline: none;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: color 0.25s, border-color 0.25s;

  border: 1px solid black;
  border-radius: 5px;
  padding: 0.25em 0.5em;
}

button:hover{
  color: #c00000;
  border-color: #c00000;
}

button:disabled {
  color: #dddddd;
  border-color: #dddddd;
  cursor: not-allowed;
}

button > *:not(:last-child) {
  margin-right: 0.25em;
}



@media only screen and (max-width: 600px) {
  button > *:not(:first-child) {
    display: none;
  }

  button > *:first-child {
    margin-right: 0;
  }
}



.modal_close_button {
  top: 10px !important;
  right: 15px !important;
}

.modal_picker_wrapper {
  height: 50vh;
  width: 75vw;
}

.modal_picker {
  height: 100% !important;
}

.toolbar {
  display: flex;
  align-items: center;
  margin: 1em 0;
  padding: 0.5em 0;
  border-bottom: 2px solid #dddddd;
}

.spacer {
  flex-grow: 1;
}

button:not(:last-child){
  margin-right: 5px;
}

.members_container{
  max-height: 300px;
  overflow-y: auto;
}


</style>
