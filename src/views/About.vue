<template>
  <v-card>
    <v-card-title>Group manager GUI</v-card-title>
    <v-card-subtitle>v{{ version }}</v-card-subtitle>
    <v-card-text>
      GUI for the group management microservice. Developed and maintained by
      <a href="https://maximemoreillon.com">Maxime Moreillon</a>
    </v-card-text>
    <v-card-text>
      <v-data-table hide-default-footer :items-per-page="-1" :headers="headers" :items="services" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import pjson from '../../package.json'

const version = pjson.version

const headers = [
  { title: 'Service', key: 'name' },
  { title: 'URL', key: 'url' },
]

const services = [
  { name: 'Group manager GUI', url: window.location.origin },
  { name: 'Group manager back-end', url: import.meta.env.VITE_GROUP_MANAGER_API_URL },
  { name: 'Identification URL', url: import.meta.env.VITE_IDENTIFICATION_URL },
  { name: 'Login URL', url: import.meta.env.VITE_LOGIN_URL },
]
</script>
