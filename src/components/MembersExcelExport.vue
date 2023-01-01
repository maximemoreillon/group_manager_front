<template lang="html">
  <v-btn :loading="loading" @click="excel_export()">
    <v-icon left>mdi-file-excel</v-icon>
    <span>{{ $t("Excel export") }}</span>
  </v-btn>
</template>

<script>
import { utils, writeFile } from "xlsx"

export default {
  name: "MembersExcelExport",
  data() {
    return {
      loading: false,
    }
  },
  props: {
    user_type: String,
  },
  methods: {
    excel_export() {
      this.loading = true
      const url = `/v3/groups/${this.group_id}/${this.user_type}`
      const params = { batch_size: -1 } //arbitrarily large
      this.axios
        .get(url, { params })
        .then(({ data: { items } }) => {
          const workbook = utils.book_new()
          const ws = utils.json_to_sheet(items)
          utils.book_append_sheet(workbook, ws, "Sheet1")
          writeFile(
            workbook,
            `group_${this.group_id}_${this.user_type}_export.xlsx`
          )
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
    group_id() {
      return this.$route.params.group_id
    },
  },
}
</script>

<style lang="css" scoped></style>
