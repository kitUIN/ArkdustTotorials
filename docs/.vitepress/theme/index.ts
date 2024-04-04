import DefaultTheme from 'vitepress/theme'
import './style/var.css'
import type { Theme } from 'vitepress'
import MyLayout from './components/MyLayout.vue'
import ModernUrl from './components/ModernUrl.vue'
import McIcon from './components/McIcon.vue'
import McIconBar from './components/McIconBar.vue'
import VersionBadge from './components/VersionBadge.vue'
import VSvg from './components/VSvg.vue'
import VersionBox from './components/VersionBox.vue'
import VersionLine from './components/VersionLine.vue'
import "virtual:svg-icons-register"
export default {
  extends: DefaultTheme,
  // 使用注入插槽的包装组件覆盖 Layout
  Layout: MyLayout,
  enhanceApp({app}) {
    // 注册全局组件
    app.component('ModernUrl' , ModernUrl)
    app.component('McIcon' , McIcon)
    app.component('McIconBar' , McIconBar)
    app.component('svg-icon' , VSvg)
    app.component('VersionBadge' , VersionBadge)
    app.component('VersionBox' , VersionBox)
    app.component('VersionLine' , VersionLine)
  }
} satisfies Theme