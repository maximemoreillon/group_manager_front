<template>
  <div id="app">
    <AppTemplate
      applicationName="Group manager"
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
      ]
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
}

button:hover{
  color: #c00000;
}

button:disabled {
  color: #dddddd;
  cursor: not-allowed;
}

button > *:not(:last-child) {
  margin-right: 0.25em;
}

button.bordered {
  border: 1px solid black;
  border-radius: 5px;
  padding: 0.25em 0.5em;
}

button.bordered:hover {
  border-color: #c00000;
}

button.bordered:disabled {
  border-color: #dddddd;
}
</style>
