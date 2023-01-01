<template>
  <v-card max-width="60em" class="mx-auto">
    <v-toolbar flat>
      <v-btn exact icon :to="{ name: 'Groups' }">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t("Create group") }}</v-toolbar-title>
    </v-toolbar>
    <v-divider />

    <v-card-text>
      <v-form
        @submit.prevent="create_group()"
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-row align="center">
          <v-col>
            <v-text-field
              v-model="group.name"
              label="Name"
              :rules="nameRules"
              required
            />
          </v-col>
          <v-col cols="auto">
            <v-btn type="submit" :disabled="!valid">
              <v-icon left>mdi-account-multiple-plus</v-icon>
              <span>{{ $t("Create") }}</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "Users",
  data() {
    return {
      error_message: null,
      group: {
        name: "",
      },
      valid: false,
      nameRules: [(v) => !!v || "Name is required"],
    }
  },

  methods: {
    create_group() {
      if (!this.$refs.form.validate()) return
      this.error_message = null

      const url = `/v3/groups`
      const parent = this.$route.query.parent
      const group = { ...this.group, parent }

      this.axios
        .post(url, group)
        .then(({ data }) => {
          this.$router.push({ name: "Group", params: { group_id: data._id } })
        })
        .catch((error) => {
          console.error(error)
          if (error.response) this.error_message = error.response.data
        })
    },
  },
}
</script>

<style></style>
