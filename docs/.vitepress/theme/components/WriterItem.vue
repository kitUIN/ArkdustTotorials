<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'

interface Props {
  member: DefaultTheme.TeamMember
}

withDefaults(defineProps<Props>(), {
})
</script>

<template>
<div class="WriterItem">
        <figure class="avatar">
        <img class="avatar-img" :src="member.avatar" :alt="member.name" />
    </figure>
    </div>
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

.avatar {
  width: 32px;
  height: 32px;
  position: relative;
  flex-shrink: 0;
  margin: 0 auto;
  border-radius: 50%;
}

.avatar-img {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 50%;
  object-fit: cover;
}

</style>