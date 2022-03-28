<template>
  <div class="about">
    <h1>Group Manager</h1>
    <p>Author: Maxime MOREILLON</p>
    <h2>Services</h2>
    <table>
      <tr>
        <th>Service</th>
        <th>Version</th>
        <th>URL</th>
      </tr>
      <tr
        v-for="(service, index) in services"
        :key="`service_${index}`">
        <td>{{service.name}}</td>
        <td>{{service.version}}</td>
        <td>{{service.url || 'UNDEFINED'}}</td>
      </tr>
    </table>

  </div>
</template>

<script>
import pjson from '@/../package.json'

export default {
  name: 'Search',
  components: {

  },
  data(){
    return {
      version: pjson.version,
      services: [
        {
          name: 'Group manager GUI',
          url: window.location.origin,
          version: pjson.version
        },
        {
          name: 'Group manager API',
          url: process.env.VUE_APP_GROUP_MANAGER_API_URL,
          version: null
        },
        {
          name: 'Login URL',
          url: process.env.VUE_APP_IDENTIFICATION_URL,
          version: 'N/A',
        },
        {
          name: 'Identification URL',
          url: process.env.VUE_APP_LOGIN_URL,
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

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

}

tr:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

th {
  text-align: left;
}
td {
  padding: 0.25em;
}

</style>
