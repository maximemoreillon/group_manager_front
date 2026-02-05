// Using these functions because ID have changed multiple times over the course of time
export default {
  methods: {
    get_id_of_item(item) {
      if (!item) return undefined;

      const id =
        item._id ||
        item.username ||
        item.properties?._id ||
        item.properties?.username ||
        item.preferred_username ||
        item.identity?.low ||
        item.identity;

      if (!id) {
        console.warn("Item does not have a recognizable identifier", item);
      }

      return id;
    },
  },
  computed: {
    current_user_id() {
      const { current_user } = this.$store.state;
      if (!current_user) return undefined;
      return this.get_id_of_item(current_user);
    },
  },
};
