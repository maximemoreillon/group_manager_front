<template lang="html">
  <v-dialog width="50vw" v-model="dialog">
    <template v-slot:activator="{ on, attrs }">
      <v-btn outlined v-bind="attrs" v-on="on">
        <v-icon left>mdi-delete</v-icon>
        <span>{{ $t("Delete") }}</span>
      </v-btn>
    </template>

    <v-card>
      <v-card-title>{{ $t("Delete group") }}</v-card-title>

      <v-card-text>
        <v-row>
          <v-spacer />
          <v-col cols="auto">
            <v-switch v-model="deep" :label="$t('Also delete subgroups')" />
          </v-col>
          <v-spacer />
        </v-row>
      </v-card-text>

      <v-card-text>
        <v-row>
          <v-spacer />
          <v-col cols="auto">
            <v-btn @click="dialog = false">
              <v-icon left>mdi-close</v-icon>
              <span>{{ $t("Cancel") }}</span>
            </v-btn>
          </v-col>

          <v-col cols="auto">
            <v-btn color="primary" dark @click="delete_group()">
              <v-icon left>mdi-account-multiple-remove</v-icon>
              <span>{{ $t("Delete") }}</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "DeleteGroupDialog",
  data() {
    return {
      dialog: false,
      deep: false,
    }
  },
  methods: {
    delete_group() {
      this.deleting = true
      const url = `/v3/groups/${this.group_id}`
      const params = { deep: this.deep }
      this.axios
        .delete(url, { params })
        .then(() => {
          this.$router.push({ name: "UserGroups", params: { user_id: "self" } })
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          this.deleting = false
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
