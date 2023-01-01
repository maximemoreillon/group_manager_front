<template>
  <v-card max-width="60em" class="mx-auto">
    <v-toolbar flat>
      <v-toolbar-title>{{ $t("Group browser") }}</v-toolbar-title>
      <v-spacer />
      <v-btn exact :to="{ name: 'CreateGroup' }">
        <v-icon left>mdi-account-multiple-plus</v-icon>
        <span>{{ $t("Create group") }}</span>
      </v-btn>
    </v-toolbar>
    <v-divider />

    <v-card-text>
      <GroupPicker
        :usersWithNoGroup="false"
        @selection="group_selected($event)"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import GroupPicker from "@moreillon/vue_group_picker"

export default {
  name: "Groups",
  components: {
    GroupPicker,
  },
  methods: {
    group_selected(group) {
      const group_id = group._id || group.properties._id
      this.$router.push({ name: "Group", params: { group_id } })
    },
  },
}
</script>
