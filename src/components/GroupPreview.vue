<template>
  <a
  :href="`group?id=${group.identity.low}`"
  class="group_preview">

    <!-- Avatar -->
    <img
    class="avatar"
    :src="avatar_src">



    <!-- group name -->
    <div
    class="group__display_name">
      {{group.properties.name}}
    </div>

  </a>
</template>

<script>




export default {
  name: 'GroupPreview',
  props: {
    group: Object,
  },
  components: {

  },
  methods: {

  },
  computed: {
    avatar_src(){
      if(this.group.properties.avatar_src) return this.group.properties.avatar_src
      else return require('@/assets/account-multiple.svg')
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.group_preview {
  display: flex;
  align-items: center;

  text-decoration: none;
  color: currentColor;
}

.group_preview .group__display_name {
  transition: color 0.25s;
}
.group_preview:hover .group__display_name {
  color: #c00000;
}

.group_preview > *:not(:last-child) {
  margin-right: 0.2em;
}

.avatar {
  width: 1em;
  height: 1em;
  object-fit: contain;
}

.group_info {
  cursor: pointer;
}

.group_info:hover {
  color: #c00000;
}
</style>
