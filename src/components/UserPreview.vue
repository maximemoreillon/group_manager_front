<template>

  <div
    class="user_preview"
    :class="{self: user.identity.low === $store.state.current_user.identity.low}"
    @click="user_clicked()">

    <!-- Avatar -->
    <img
      class="avatar"
      :src="avatar_src">

    <!-- User name -->
    <div
      class="user_name">
      {{user.properties.display_name
        || user.properties.name_kanji
        || user.properties.name}}
    </div>

    <div class="growing_spacer" />

    <!-- slot for additional stuff like buttons -->
    <slot />

  </div>

</template>

<script>




export default {
  name: 'UserPreview',
  props: {
    user: Object,
    currentUser: Object,
    profileUrl: String,

  },
  components: {

  },
  methods: {
    user_clicked(){
      this.$router.push({ name: 'groups_of_user', params: {user_id: this.user.identity.low} })
    }
  },
  computed: {
    avatar_src(){
      if(this.user.properties.avatar_src) return this.user.properties.avatar_src
      else return require('@/assets/account.svg')
    },
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.user_preview {
  display: flex;
  align-items: center;

  text-decoration: none;
  color: currentColor;

  padding: 0.25em;

  transition: background-color 0.25s;
  cursor: pointer;
}




.user_preview:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}

.user_preview.self {
  border: 1px solid #c00000;
  //background-color: #ffdddddd;
}


.user_preview:hover {
  background-color: #eeeeee;
}



.avatar {
  width: 1em;
  height: 1em;
  object-fit: contain;
}

.user_info {
  cursor: pointer;
}

.user_info:hover {
  color: #c00000;
}

.growing_spacer {
  flex-grow: 1
}
</style>
