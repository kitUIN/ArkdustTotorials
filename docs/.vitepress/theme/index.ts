import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import MyLayout from './components/MyLayout.vue'

export default {
  extends: DefaultTheme,
  // 使用注入插槽的包装组件覆盖 Layout
  Layout: MyLayout
} satisfies Theme