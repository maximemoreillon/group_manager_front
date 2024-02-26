<template lang="html">
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
    <template v-slot:[`top`]>
      <div class="text-h6">
        <span v-if="official">{{ $t("Official") }}</span>
        <span v-if="nonofficial">{{ $t("Non-official") }}</span>
      </div>
    </template>

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
      <!-- <v-icon v-else>mdi-lock-open</v-icon> -->
    </template>

    <template v-slot:[`item.official`]="{ item }">
      <v-icon v-if="item.official">mdi-check</v-icon>
      <!-- <v-icon v-else>mdi-close</v-icon> -->
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "GroupsOfUser",
  props: {
    as: { type: String, default: () => "member" },
    shallow: Boolean,
    official: Boolean,
    nonofficial: Boolean,
  },
  data() {
    return {
      loading: false,
      groups: [],
      total: 0,
      options: {},
      footerProps: { "items-per-page-options": [50, 100, 500, -1] },
      headers: [
        { value: "image", text: "", width: "50px" },
        { value: "name", text: "Name" },
        { value: "restricted", text: "Restricted" },
      ],
    }
  },
  mounted() {
    // this.get_groups()
  },
  watch: {
    shallow() {
      this.get_groups()
    },
    user_id() {
      this.get_groups()
    },
    options: {
      handler() {
        this.get_groups()
      },
      deep: true,
    },
  },
  methods: {
    get_groups() {
      this.loading = true
      // NOTE: adding 's' after 'as'
      const url = `/v3/${this.as}s/${this.user_id}/groups`

      const { itemsPerPage, page } = this.options
      const params = {
        batch_size: itemsPerPage,
        start_index: (page - 1) * itemsPerPage,
        shallow: this.shallow ? true : undefined, // do not send if not true
        official: this.official ? true : undefined, // do not send if not true
        nonofficial: this.nonofficial ? true : undefined, // do not send if not true
      }

      this.axios
        .get(url, { params })
        .then(({ data: { count, items } }) => {
          this.total = count
          this.groups = items
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
  },
}
</script>
