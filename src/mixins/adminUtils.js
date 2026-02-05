export default {
  computed: {
    current_user_is_admin() {
      return (
        this.is_admin(this.current_user_id) ||
        this.$store.getters.current_user.isAdmin
      );
    },
  },

  methods: {
    is_admin(id) {
      if (!id) return false;
      return this.$store.getters.admin_identifiers.has(id);
    },
  },
};
