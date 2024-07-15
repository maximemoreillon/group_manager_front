<template>
  <v-card max-width="60em" class="mx-auto">
    <v-toolbar flat>
      <v-toolbar-title>{{ $t("Groups") }}</v-toolbar-title>
      <v-spacer />
      <v-btn exact :to="{ name: 'CreateGroup' }" color="primary">
        <v-icon left>mdi-account-multiple-plus</v-icon>
        <span>{{ $t("Create group") }}</span>
      </v-btn>
      <template v-slot:extension>
        <v-tabs v-model="tab">
          <v-tab>{{ $t("Browse") }}</v-tab>
          <v-tab>{{ $t("Search") }}</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <v-divider />

    <v-card-text>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <GroupPicker
            :groupManagerApiUrl="groupManagerApiUrl"
            :usersWithNoGroup="false"
            @selection="group_selected($event)"
          />
        </v-tab-item>
        <v-tab-item>
          <v-card outlined>
            <v-card-text>
              <GroupSearch />
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import GroupPicker from "@moreillon/vue_group_picker"
import GroupSearch from "../components/GroupSearch.vue"

const { VUE_APP_GROUP_MANAGER_API_URL } = process.env

export default {
  name: "Groups",
  components: {
    GroupPicker,
    GroupSearch,
  },
  data() {
    return {
      tab: null,
      groupManagerApiUrl: VUE_APP_GROUP_MANAGER_API_URL,
    }
  },
  methods: {
    group_selected(group) {
      const group_id = group._id || group.properties._id
      this.$router.push({ name: "Group", params: { group_id } })
    },
  },
}
</script>
