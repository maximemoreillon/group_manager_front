<template>
  <AppTemplate :options="options" @user="get_user($event)">
    <template v-slot:nav>
      <v-list dense nav>
        <v-list-item>
          <LocaleSelector />
        </v-list-item>
        <v-divider />
        <v-list-item
          v-for="(item, index) in nav"
          :key="`nav_item_${index}`"
          :to="item.to"
          exact
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </AppTemplate>
</template>

<script>
import AppTemplate from "@moreillon/vue_application_template_vuetify"
import LocaleSelector from "./components/LocaleSelector.vue"

const { VUE_APP_LOGIN_URL, VUE_APP_IDENTIFICATION_URL } = process.env

export default {
  name: "App",

  components: {
    AppTemplate,
    LocaleSelector,
  },

  data: () => ({
    options: {
      title: "Group manager",
      login_url: VUE_APP_LOGIN_URL,
      identification_url: VUE_APP_IDENTIFICATION_URL,
    },
  }),

  methods: {
    get_user(user) {
      this.$store.commit("set_current_user", user)
    },
  },
  computed: {
    nav() {
      return [
        {
          title: this.$t("My Groups"),
          to: { name: "UserGroups", params: { user_id: "self" } },
          icon: "mdi-account",
        },
        {
          title: this.$t("Groups"),
          to: { name: "Groups" },
          icon: "mdi-account-multiple",
        },
        {
          title: this.$t("Create group"),
          to: { name: "CreateGroup" },
          icon: "mdi-account-multiple-plus",
        },
        {
          title: this.$t("About"),
          to: { name: "About" },
          icon: "mdi-information-outline",
        },
      ]
    },
  },
}
</script>
