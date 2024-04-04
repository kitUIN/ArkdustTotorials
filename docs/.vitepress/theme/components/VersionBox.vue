<script setup lang="ts">
import Popper from "vue3-popper";
import "./styles/popper.css";
import { VersionLink } from "./VersionBadge.vue";
import VersionBadge from "./VersionBadge.vue";
import { useRouter } from "vitepress";

const router = useRouter();
export type Version = {
  current?: VersionLink;
  others?: VersionLink[];
};
interface Props {
  version: Version;
}
withDefaults(defineProps<Props>(), {});
// console.log(props.version?.others);
</script>

<template>
  <Popper  :key="version.current?.text"
    placement="bottom"
    :disabled="version.others && version.others.length > 0 ? false : true"
  >
    <VersionBadge
      :text="version.current?.text"
      :loader="version.current?.loader"
      :link="version.others && version.others.length > 0 ? '' : undefined"
    />
    <template #content="{ close }">
      <div class="box-sw" >
        <span class="text-sw">切换版本:</span>
        <div class="badge-box">
          <VersionBadge :key="ver.text"
            v-for="ver in version.others"
            :text="ver.text"
            :loader="ver.loader"
            :link="ver.link"
            :onclick="
              () => {
                close();
                if (ver.link && ver.link !== '') {
                  router.go(ver.link);
                }
              }
            "
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
  color: var(--vp-c-text-1);
  font-size: 0.8em;
}
</style>
