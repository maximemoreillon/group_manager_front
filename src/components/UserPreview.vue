<template>
  <a
  :href="`${profileUrl}?id=${user.identity.low}`"
  class="user_preview">

    <!-- Avatar -->
    <img
    class="avatar"
    :src="avatar_src">



    <!-- User name -->
    <div
    class="user__display_name">
      {{user.properties.name_kanji}}
    </div>

  </a>
</template>

<script>




export default {
  name: 'UserPreview',
  props: {
    user: Object,
    currentUser: Object,
    apiUrl: String,
    profileUrl: String,

  },
  components: {

  },
  methods: {

  },
  computed: {
    avatar_src(){
      if(this.user.properties.avatar_src) return this.user.properties.avatar_src
      else return require('@/assets/account.svg')
    }
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
}

.user_preview .user__display_name {
  transition: color 0.25s;
}
.user_preview:hover .user__display_name {
  color: #c00000;
}

.user_preview > *:not(:last-child) {
  margin-right: 0.2em;
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
</style>
