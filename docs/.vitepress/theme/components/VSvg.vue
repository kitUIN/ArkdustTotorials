<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps({
  iconClass: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: () => "",
  },
});

const iconName = computed(() => {
//   console.log(`#icon-${props.iconClass}`);
  return `#icon-${props.iconClass}`;
});
const svgClass = computed(() => {
  return props.className ? "svg-icon " + props.className : "svg-icon";
});
</script>
<style scoped>
.svg-icon {
  width: 16px;
  height: 16px;
  /* vertical-align: -0.15em; */
  /* fill: currentColor; */
  /* overflow: hidden; */
}
 
.svg-external-icon {
  background-color: currentColor;
  mask-size: cover!important;
  display: inline-block;
}
</style>
