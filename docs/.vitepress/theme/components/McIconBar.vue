<script setup lang="ts">
import McIcon from "./McIcon.vue";
const iconType = {
  "health-ex": "health-%1$s-ex",
  health: "health-%1$s",
  toughness: "toughness-%1$s",
  "toughness-diamond": "toughness-diamond-%1$s",
  exp: "exp",
  armor: "armor-%1$s",
  oxygen: "oxygen-%1$s",
  hunger: "food-%1$s-hunger-level",
  saturation: "food-empty-saturation-level",
  "health-jockey": "health-%1$s-jockey",
};
interface Props {
  count: number;
  total: number;
  icon: string;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  total: 0,
  icon: "HEALTH",
});
let fullIcon = iconType[props.icon].replace("%1$s", "full");
let halfIcon = iconType[props.icon].replace("%1$s", "half");
const emptyIcon =
  props.icon === "health-ex"
    ? "health-empty"
    : iconType[props.icon].replace("%1$s", "empty");
let cot = props.count;
let full = 0,
  half = 0;
if (props.icon == "saturation") {
  cot *= 2;
  full = Math.floor(cot / 4);
  half = cot % 4;
} else {
  full = Math.floor(cot / 2);
  half = cot % 2;
}
let rest = Math.ceil(props.total / 2) - full - half;
if (props.icon == "exp") {
  full = 1;
  half = rest = 0;
} else if (props.icon == "saturation") {
  fullIcon += "-100";
  halfIcon += `-${half * 25}`;
  rest = 0;
}

</script>

<template>
  <span class="McIconBar">
    <McIcon v-for="i in full" :icon="fullIcon" />
    <McIcon v-if="half > 0" :icon="halfIcon" />
    <McIcon v-for="i in rest" v-if="rest > 0" :icon="emptyIcon" />
  </span>
</template>
<style scoped>
.McIconBar {
  display: inline-flex;
}
</style>
