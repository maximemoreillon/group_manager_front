<template>
  <v-card max-width="60em" class="mx-auto">
    <v-toolbar flat>
      <v-row align="center">
        <v-col cols="auto">
          <v-toolbar-title v-if="user">
            <a v-if="user_profile_url" :href="user_profile_url">{{
              user.display_name
            }}</a>
            <span v-else>{{ user.display_name }}</span>
          </v-toolbar-title>
          <v-toolbar-title v-else>
            <v-progress-circular indeterminate />
          </v-toolbar-title>
        </v-col>

        <v-spacer />
        <v-col cols="auto">
          <v-btn exact :to="{ name: 'CreateGroup' }">
            <v-icon left>mdi-account-multiple-plus</v-icon>
            <span>{{ $t("Create group") }}</span>
          </v-btn>
        </v-col>
      </v-row>

      <template v-slot:extension>
        <v-tabs v-model="relation_tab">
          <v-tab>{{ $t("As member") }}</v-tab>
          <v-tab>{{ $t("As administrator") }}</v-tab>
        </v-tabs>
        <v-spacer />
        <v-switch v-model="subgroups" label="Subgroups" />
      </template>
    </v-toolbar>
    <v-divider />

    <v-card-text>
      <v-tabs-items v-model="relation_tab">
        <v-tab-item
          v-for="relationship in ['member', 'administrator']"
          :key="`as_${relationship}`"
        >
          <v-card outlined>
            <v-toolbar flat>
              <v-tabs v-model="officiality_tab">
                <v-tab>{{ $t("Official") }}</v-tab>
                <v-tab>{{ $t("Non-official") }}</v-tab>
              </v-tabs>
            </v-toolbar>
            <v-divider />
            <v-card-text>
              <v-tabs-items v-model="officiality_tab">
                <v-tab-item
                  v-for="officiality in ['official', 'nonofficial']"
                  :key="`as_${relationship}_${officiality}`"
                >
                  <GroupsOfUser
                    :official="officiality === 'official'"
                    :nonofficial="officiality === 'nonofficial'"
                    :shallow="!subgroups"
                    :as="relationship"
                  />
                </v-tab-item>
              </v-tabs-items>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import GroupsOfUser from "@/components/GroupsOfUser.vue"

const { VUE_APP_USER_MANAGER_FRONT_URL } = process.env

export default {
  name: "UserGroups",
  components: {
    GroupsOfUser,
  },
  data() {
    return {
      user: null,
      loading: false,
      relation_tab: null,
      officiality_tab: null,
      subgroups: false,
    }
  },
  mounted() {
    this.get_user()
  },
  watch: {
    user_id() {
      this.get_user()
    },
  },
  methods: {
    get_user() {
      this.loading = true
      const url = `/v3/users/${this.user_id}`
      this.axios
        .get(url)
        .then(({ data }) => {
          this.user = data
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
  computed: {
    user_id() {
      return this.$route.params.user_id
    },
    user_profile_url() {
      if (!VUE_APP_USER_MANAGER_FRONT_URL) return
      return `${VUE_APP_USER_MANAGER_FRONT_URL}/users/${this.user_id}`
    },
  },
}
</script>
