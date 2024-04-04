<script setup lang="ts">
import { computed, toRefs } from "vue";
import VersionBox, { Version } from "./VersionBox.vue";

type MVersion = {
  vanilla?: Version;
  loader?: Version;
};

interface Props {
  versions?: MVersion;
}

const props = withDefaults(defineProps<Props>(), {});

const vers = computed(() => {
  let l = new Array<Version>();
  if (props.versions?.vanilla) {
    l.push(props.versions.vanilla);
  }
  if (props.versions?.loader) {
    l.push(props.versions.loader);
  }
  return l;
});
</script>

<template>
  <div class="Writers">
    <div class="container">
        <VersionBox v-for="version in vers"  :version="version" />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 0 auto;
  max-width: 1152px;
}
</style>
