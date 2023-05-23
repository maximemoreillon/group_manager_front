<template>
  <v-card>
    <v-card-title>Group manager GUI</v-card-title>
    <v-card-subtitle> v {{ version }} </v-card-subtitle>
    <v-card-text>
      GUI for the group management microservice. Developed and maintained by
      <a href="https://maximemoreillon.com">Maxime Moreillon</a>
    </v-card-text>
    <v-card-text>
      <v-data-table
        hide-default-footer
        :itemsPerPage="-1"
        :headers="headers"
        :items="services"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import pjson from "@/../package.json"

const {
  VUE_APP_GROUP_MANAGER_API_URL,
  VUE_APP_IDENTIFICATION_URL,
  VUE_APP_LOGIN_URL,
} = process.env

export default {
  name: "About",
  data() {
    return {
      version: pjson.version,
      headers: [
        { text: "Service", value: "name" },
        { text: "Version", value: "version" },
        { text: "URL", value: "url" },
      ],
      services: [
        {
          name: "Group manager GUI",
          url: window.location.origin,
        },
        {
          name: "Group manager back-end",
          url: VUE_APP_GROUP_MANAGER_API_URL,
        },
        {
          name: "Identification URL",
          url: VUE_APP_IDENTIFICATION_URL,
        },
        {
          name: "Login URL",
          url: VUE_APP_LOGIN_URL,
        },
      ],
    }
  },
}
</script>

<style scoped></style>
