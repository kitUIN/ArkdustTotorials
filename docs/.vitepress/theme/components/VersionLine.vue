<script setup lang="ts">
import { computed, toRefs } from "vue";
import VersionBox, { Version } from "./VersionBox.vue";

interface Props {
  versions?: Array<Version>;
}
withDefaults(defineProps<Props>(), {});

</script>

<template>
  <div class="Writers">
    <div class="container">
        <VersionBox v-for="version in versions"  :version="version" />
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
