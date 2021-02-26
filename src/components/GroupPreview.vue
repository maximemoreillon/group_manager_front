<template>

  <div
    v-on:click="group_clicked"
    class="group_preview">

    <!-- Avatar -->
    <img
    class="avatar"
    :src="avatar_src">

    <!-- group name -->
    <div
      class="group_name">
      {{group.properties.name}}
    </div>

    <div class="growing_spacer" />

    <slot />

  </div>

</template>

<script>




export default {
  name: 'GroupPreview',
  props: {
    group: Object,
  },


  methods: {
    group_clicked(){
      this.$router.push({name: 'group', params: {group_id: this.group_id}})
    }
  },
  computed: {
    avatar_src(){
      if(this.group.properties.avatar_src) return this.group.properties.avatar_src
      else return require('@/assets/account-multiple.svg')
    },
    group_id(){
      return this.group.identity.low
        || this.group.identity
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
  padding: 0.25em;

  transition: background-color 0.25s;
  cursor: pointer;
}

.group_preview:not(:last-child) {
  border-bottom: 1px solid #dddddd;
}


.group_preview:hover {
  background-color: #eeeeee;
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

.growing_spacer {
  flex-grow: 1
}
</style>
