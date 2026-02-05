<template>
  <AppTemplate :options="options" @user="handleUserEvent($event)" @tokens="handleTokensEvent($event)">
    <template v-slot:nav>
      <v-list dense nav>
        <v-list-item>
          <LocaleSelector />
        </v-list-item>
        <v-divider />
        <v-list-item v-for="(item, index) in nav" :key="`nav_item_${index}`" :to="item.to" exact>
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

const {
  VUE_APP_LOGIN_URL,
  VUE_APP_IDENTIFICATION_URL,
  VUE_APP_HOMEPAGE_URL,
  VUE_APP_LOGIN_HINT,
  VUE_APP_OIDC_AUTHORITY,
  VUE_APP_OIDC_CLIENT_ID,
  VUE_APP_OIDC_AUDIENCE,
} = process.env

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
      homepage_url: VUE_APP_HOMEPAGE_URL,
      login_hint: VUE_APP_LOGIN_HINT,
      oidc: {
        authority: VUE_APP_OIDC_AUTHORITY,
        client_id: VUE_APP_OIDC_CLIENT_ID,
        extraQueryParams: {
          audience: VUE_APP_OIDC_AUDIENCE,
        },
      },
    },
  }),

  methods: {
    handleUserEvent(user) {
      this.$store.commit("set_current_user", user)
      this.get_admins()

    },
    handleTokensEvent(tokens) {
      this.$store.commit("set_tokens", tokens)
    },
    get_admins() {
      const url = `/v3/system/administrators`
      this.axios
        .get(url)
        .then(({ data }) => {
          this.$store.commit("set_admins", data)
        })
        .catch((error) => {
          console.error(error)
        })
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
