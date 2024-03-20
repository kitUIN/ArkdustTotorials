<script setup lang="ts">
import type { DefaultTheme } from "vitepress/theme";
import Popper from "vue3-popper";
import VPTeamMembersItem from "vitepress/dist/client/theme-default/components/VPTeamMembersItem.vue";
import "./styles/popper.css";

interface Props {
  member: DefaultTheme.TeamMember;
}

withDefaults(defineProps<Props>(), {});
</script>

<template>
  <Popper>
    <div class="WriterItem">
      <figure class="out-avatar">
        <img class="out-avatar-img" :src="member.avatar" :alt="member.name" />
      </figure>
    </div>
    <template #content>
      <VPTeamMembersItem class="extraItem"  size="small" :member="member"></VPTeamMembersItem>
    </template>
  </Popper>
</template>

<style scoped>
.WriterItem {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.extraItem {
  color: var(--vp-c-text-1);
  min-width: 276px;
  min-height: 232px;
}
.out-avatar {
  width: 32px;
  height: 32px;
  position: relative;
  flex-shrink: 0;
  margin: 0 auto;
  border-radius: 50%;
}

.out-avatar-img {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 50%;
  object-fit: cover;
}

</style>
