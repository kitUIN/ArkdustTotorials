<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import WriterItem from './WriterItem.vue'

interface Props {
  members: DefaultTheme.TeamMember[]
}

const props = withDefaults(defineProps<Props>(), {
})
const classes = computed(() => [`count-${props.members.length}`])
</script>

<template>
  <div class="Writers"  >
    <div class="container">
      <div v-for="member in members" :key="member.name" class="item">
        <WriterItem :member="member" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  gap: 12px;
  margin: 0 auto;
  max-width: 1152px;
}
</style>