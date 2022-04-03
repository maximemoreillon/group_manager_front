<template>
  <v-card>
    <v-card-title>Group manager GUI</v-card-title>
    <v-card-text>
      GUI for the group management microservice. Developed and maintained by <a href="https://maximemoreillon.com">Maxime Moreillon</a>
    </v-card-text>
    <v-card-text>
      <v-data-table
        hide-default-footer
        :itemsPerPage="-1"
        :headers="headers"
        :items="services"/>
    </v-card-text>


  </v-card>
</template>

<script>
import pjson from '@/../package.json'
export default {
  name: 'About',
  data () {
    return {
      headers: [
        {text: 'Service', value: "name"},
        {text: 'Version', value: "version"},
        {text: 'URL', value: "url"},

      ],
      services: [
        {
          name: 'Group manager GUI',
          url: window.location.origin,
          version: pjson.version
        },
        {
          name: 'Group manager back-end',
          url: process.env.VUE_APP_GROUP_MANAGER_API_URL,
          version: null
        },
        {
          name: 'Authentication',
          url: process.env.VUE_APP_IDENTIFICATION_URL,
          version: 'N/A',
        },
      ],
    }
  },
  mounted () {
    this.get_services_version()
  },
  methods: {

    get_services_version () {
      this.services.forEach((service) => {
        if (service.version) return
        service.version = 'Connecting...'
        this.axios.get(service.url)
          .then(({ data }) => { service.version = data.version })
          .catch(() => { service.version = 'Unable to connect' })
      })
    }
  }

}
</script>

<style scoped>


</style>
