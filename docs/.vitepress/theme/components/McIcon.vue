<script setup lang="ts">
import McIconChild from "./McIconChild.vue";
const iconType =  {
  'health-ex' : 'health-%1$s-ex',
  'health' : 'health-%1$s',
  'toughness' : 'toughness-%1$s',
  'toughness-diamond' : 'toughness-diamond-%1$s',
  'exp' : 'exp',
  'armor':'armor-%1$s',
  'oxygen':'oxygen-%1$s',
  'hunger':'food-%1$s-hunger-level',
  'health-jockey':'health-%1$s-jockey'
}
interface Props {
  count: number;
  total: number;
  icon: string;
}

const props = withDefaults(defineProps<Props>(), { count: 0,total:0, icon: 'HEALTH'});
const fullIcon = iconType[props.icon].replace('%1$s', 'full');
const halfIcon = iconType[props.icon].replace('%1$s', 'half');
const emptyIcon = props.icon==='health-ex' ? 'health-empty' : iconType[props.icon].replace('%1$s', 'empty');
let full = Math.floor(props.count / 2);
let half = props.count % 2;
let rest = Math.ceil(props.total / 2) - full - half;
if (props.icon == 'exp'){
  full = 1;
  half = rest = 0;
}
</script>

<template>
  <span class="McIcon">
    <McIconChild v-for="i in full"  :icon="fullIcon" />
    <McIconChild v-for="i in half" v-if="half > 0"  :icon="halfIcon" />
    <McIconChild v-for="i in rest" v-if="rest > 0"  :icon="emptyIcon" />
  </span>
</template>
<style scoped>
.McIcon{
    display: flex;
}
</style>