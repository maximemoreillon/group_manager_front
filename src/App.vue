<template>
  <div id="app">
    <AppTemplate
      authenticate
      applicationName="グループマネージャー">
      <template v-slot:navigation>

        <router-link :to="{ name: 'groups_of_user', params: {user_id: 'self'}}">
          <span>My groups</span>
        </router-link>

        <router-link :to="{ name: 'group_browser'}">
          <span>Group browser</span>
        </router-link>

        <router-link :to="{ name: 'about'}">
          <span>About</span>
        </router-link>

      </template>
    </AppTemplate>
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

    }
  }
}
</script>

<style>
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
</style>
