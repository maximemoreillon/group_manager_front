<template>
  <v-dialog v-model="dialog" width="70vw">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="primary" dark v-bind="attrs" v-on="on">
        <v-icon left>mdi-account-multiple-plus</v-icon>
        <span>Add {{ as || "group" }} group</span>
      </v-btn>
    </template>

    <v-card>
      <v-card-title>Add {{ as || "group" }} group</v-card-title>

      <v-card-text>
        <GroupPicker
          @selection="group_selected($event)"
          :groupManagerApiUrl="groupManagerApiUrl"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import GroupPicker from "@moreillon/vue_group_picker"

const { VUE_APP_GROUP_MANAGER_API_URL } = process.env

export default {
  name: "AddGroupDialog",
  components: {
    GroupPicker,
  },
  props: {
    as: String,
  },
  data() {
    return {
      dialog: false,
      groupManagerApiUrl: VUE_APP_GROUP_MANAGER_API_URL,
    }
  },

  methods: {
    group_selected(group) {
      const _id = group._id || group.properties._id
      this.$emit("groupAdd", { _id })
      this.dialog = false
    },
  },
}
</script>

<style lang="css" scoped></style>
