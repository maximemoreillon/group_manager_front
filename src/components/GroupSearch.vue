<template>
  <div>
    <v-form @submit.prevent="get_groups()">
      <v-row align="center">
        <v-col>
          <v-text-field v-model="search" label="Group name" />
        </v-col>
        <v-col cols="auto">
          <v-btn type="submit" icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
    <v-data-table
      :items="groups"
      :headers="headers"
      :loading="loading"
      :options.sync="options"
      :server-items-length="total"
      :items-per-page="50"
      :footer-props="footerProps"
      disable-sort
      disable-filtering
    >
      <template v-slot:[`item.image`]="{ item }">
        <v-img
          v-if="item.avatar_src"
          contain
          width="2.5em"
          height="2.5em"
          :src="item.avatar_src"
        />
        <v-icon size="2.5em" v-else> mdi-account-multiple </v-icon>
      </template>

      <template v-slot:[`item.name`]="{ item }">
        <router-link :to="{ name: 'Group', params: { group_id: item._id } }">
          {{ item.name }}
        </router-link>
      </template>

      <template v-slot:[`item.restricted`]="{ item }">
        <v-icon v-if="item.restricted">mdi-lock</v-icon>
      </template>

      <template v-slot:[`item.official`]="{ item }">
        <v-icon v-if="item.official">mdi-check</v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: "GroupSearch",
  data() {
    return {
      loading: false,
      search: "",
      groups: [],
      total: 0,
      options: {},
      footerProps: { "items-per-page-options": [3, 100, 500, -1] },
      headers: [
        { value: "image", text: "Avatar" },
        { value: "name", text: "Name" },
        { value: "official", text: "Official" },
        { value: "restricted", text: "Restricted" },
      ],
    }
  },
  watch: {
    options: {
      handler() {
        this.get_groups()
      },
      deep: true,
    },
  },
  methods: {
    async get_groups() {
      try {
        this.loading = true
        this.groups = []
        const params = { search: this.search }
        const {
          data: { count, items },
        } = await this.axios.get("/v3/groups", { params })
        this.total = count
        this.groups = items
      } catch (error) {
        alert("Failed to search groups")
        console.error(error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
