<script lang="ts">
import "../js/mcicon.js";
export default {
  props: {
    icon: String
  },
  setup(props) {

    return {
      iconName: '#icon-' + props.icon
    }
  }
}
</script>

<template>
    <svg
      class="common-mcicon"
      aria-hidden="true"
    >
      <use :xlink:href="iconName" />
    </svg>
  </template>

<style scoped>
.common-mcicon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}
</style>
