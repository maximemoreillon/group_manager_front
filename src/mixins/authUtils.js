export default {

  computed: {
    current_user_is_admin () {
      const {current_user} = this.$store.state
      if(!current_user) return undefined
      return current_user.properties.isAdmin
        || current_user.properties.administrator
    }
  }
}
