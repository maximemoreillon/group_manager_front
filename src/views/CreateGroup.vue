<template>
  <div class="groups">

    <h1>Create group</h1>



    <!-- Creating a group -->
    <form class="" v-on:submit.prevent="create_group()">
      <label>Group name:</label>
      <input type="text" ref="new_group_name" placeholder="Group name">
      <input type="submit" class="hidden">
      <button
        type="button"
        class="bordered"
        v-on:click="create_group()" >
        <font-awesome-icon icon="plus" />
        <span>Create</span>
      </button>


    </form>




  </div>
</template>

<script>
// Icons
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlus,
  faUserPlus,
  faEdit,
  faSave,
  faSignInAlt,
  faSignOutAlt,
  faUserTie,
  faUserSlash,
  faTrash,

} from '@fortawesome/free-solid-svg-icons'

library.add(
  faPlus,
  faUserPlus,
  faEdit,
  faSave,
  faSignInAlt,
  faSignOutAlt,
  faUserTie,
  faUserSlash,
  faTrash,

)

export default {
  name: 'Group',
  components: {
    FontAwesomeIcon,
  },
  data(){
    return {

    }
  },



  methods: {

    create_group(){
      this.loading = true;
      this.axios.post(`${process.env.VUE_APP_GROUP_MANAGER_API_URL}/groups`, {
        name: this.$refs.new_group_name.value,
      })
      .then( (response) => {
        this.$router.push({name: 'group', params: {group_id: response.data.identity.low}})
      })
      .catch( (error) => {
        console.error(error)
        alert(`Error while creating group`)
      })
    },



  },
  computed: {


  }
}
</script>

<style scoped>

.hidden {
  display: none;
}

form {
  display: flex;
  align-items: center;
}

form > *:not(:last-child){
  margin-right: 1em;
}

form input {
  flex-grow: 1;
  max-width: 400px;
}


</style>
