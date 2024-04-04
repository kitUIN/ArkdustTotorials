<script setup lang="ts">
import Popper from "vue3-popper";
import "./styles/popper.css";
import { VersionLink } from "./VersionBadge.vue";
import VersionBadge from "./VersionBadge.vue";

export type Version = {
  current?: VersionLink;
  others?: VersionLink[];
};
interface Props {
  version: Version;
}

withDefaults(defineProps<Props>(), {});
</script>

<template>
  <Popper placement="bottom" :disabled="version.others ? false : true">
    <VersionBadge
      :text="version.current?.text"
      :loader="version.current?.loader ?? 'vanilla'"
      :link="version.others ? '' : undefined"
    />
    <template #content>
      <div class="box-sw">
        <span class="text-sw">切换版本:</span>
        <div class="badge-box">
          <VersionBadge
            v-for="ver in version.others"
            :text="ver.text"
            :loader="ver.loader ?? 'vanilla'"
            :link="ver.link"
          />
        </div>
      </div>
    </template>
  </Popper>
</template>

<style scoped>
.badge-box {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin: 6px;
}
.box-sw {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 6px;
  margin-top: 10px;
}
.text-sw {
  font-size: 0.8em;
}
</style>
