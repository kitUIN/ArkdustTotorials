<script setup lang="ts">
interface Props {
  url: string;
  title: string;
  stitle?: string;
  icon?: string;
  desc?: string;
}

withDefaults(defineProps<Props>(), {});
</script>

<template>
  <div class="ModernUrl">
    <a class="border-box box-pointer" :href="url">
      <div class="thumb-box" v-if="icon">
        <img class="thumb" :src="icon" :alt="stitle" />
      </div>
      <div class="title-box">
        <div class="title">{{ title }}</div>
        <div class="sub-title" v-if="stitle">{{ stitle }}</div>
      </div>
    </a>
    <div class="desc-box" v-if="desc">
      <span class="desc">{{ desc }}</span>
    </div>
  </div>
</template>

<style scoped>
.ModernUrl {
  display: flex;
  align-items: stretch;
  position: relative;
  flex-direction: column;
  padding-bottom: 8px;
  padding-top: 4px;
}
.border-box {
  cursor: pointer;
  align-items: stretch;
  text-align: inherit;
  text-decoration: none;
  display: flex;
  flex-basis: auto;
  flex-direction: row;
  position: relative;
  flex-wrap: nowrap;
  box-sizing: border-box;
  border-bottom-color: rgba(227, 232, 237, 1);
  border-left-color: rgba(227, 232, 237, 1);
  border-right-color: rgba(227, 232, 237, 1);
  border-top-color: rgba(227, 232, 237, 1);
  border-bottom-width: 1px;
  border-left-width: 1px;
  border-right-width: 1px;
  border-top-width: 1px;
  padding: 16px;
  border-bottom-style: solid;
  border-left-style: solid;
  border-right-style: solid;
  border-top-style: solid;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.desc-box {
  padding-top: 8px;
  display: flex;
  justify-content: space-around;
}
.desc {
  font-size: 12px;
  color: rgba(136, 153, 168, 1);
  text-align: center;
  font-weight: 400;
  line-height: 18px;
}

.box-pointer {
  margin-top: 4px;
  margin-bottom: 0px;
  transition: all 0.2s ease-in-out;
  color: rgba(0, 0, 0, 1);
}
.box-pointer:hover {
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.1);
  margin-top: 0px;
  margin-bottom: 4px;
  color: #3a5ccc;
  transition: all 0.2s ease-in-out;
}
.title-box{
    width: 0;
    flex: 1;
  display: flex;
    flex-direction: column;
    justify-content: space-around;
}
.title {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.sub-title {
  white-space: nowrap;
  text-align: inherit;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  color: rgba(92, 105, 117, 1);
  line-height: 22px;
  text-overflow: ellipsis;
  overflow-x: hidden;
  overflow-y: hidden;
}
.thumb-box {display: flex;
    flex-direction: column;
    justify-content: space-around;
  margin-right: 16px;
}
.thumb {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}
</style>
