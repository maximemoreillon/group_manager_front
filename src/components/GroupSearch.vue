<template>
  <div>
    <v-form @submit.prevent="get_groups()">
      <v-row align="center" dense>
        <v-col>
          <v-text-field v-model="search" label="Group name" />
        </v-col>
        <v-col cols="auto">
          <v-btn type="submit" icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row align="center" dense>
        <v-col cols="auto">
          <v-switch v-model="subgroups" label="Include subgroups" />
        </v-col>
        <v-spacer />
        <v-col cols="auto">
          <v-checkbox label="Official" v-model="official" />
        </v-col>
        <v-col cols="auto">
          <v-checkbox label="Non-official" v-model="nonofficial" />
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
      subgroups: true,
      official: true,
      nonofficial: true,
      groups: [],
      total: 0,
      options: {},
      footerProps: { "items-per-page-options": [50, 100, 500, -1] },
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
    subgroups() {
      this.get_groups()
    },
    official() {
      this.get_groups()
    },
    nonofficial() {
      this.get_groups()
    },
  },
  methods: {
    async get_groups() {
      try {
        this.loading = true
        this.groups = []
        const { itemsPerPage, page } = this.options
        const params = {
          search: this.search,
          batch_size: itemsPerPage,
          start_index: (page - 1) * itemsPerPage,
        }
        if (!this.subgroups) params.shallow = true
        if (!this.official) params.nonofficial = true
        if (!this.nonofficial) params.official = true

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
