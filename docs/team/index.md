---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
    {
    avatar: '/github/AW-CRK14.png',
    name: 'AW-CRK14',
    title: '发起者',
    links: [
      { icon: 'github', link: 'https://github.com/AW-CRK14' },
    ]
  },
  {
    avatar: '/github/kitUIN.png',
    name: 'kitUIN',
    title: '贡献者',
    links: [
      { icon: 'github', link: 'https://github.com/kitUIN' },
    ]
  }
  
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      文档编写团队
    </template>
    <template #lead>
      感谢以下成员为文档编写做出的贡献
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers size="small"
    :members="members"
  />
</VPTeamPage>