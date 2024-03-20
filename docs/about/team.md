---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

import { data } from "../.vitepress/theme/datas/members.data.ts";
const members =  data.members;

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