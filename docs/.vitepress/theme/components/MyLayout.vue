<script setup>
import DefaultTheme from "vitepress/theme";
import Writers from "./Writers.vue";
import { useData } from "vitepress";
import { data } from "../members.data.ts";
const members =  data.members;

const { frontmatter } = useData();
const { Layout } = DefaultTheme;


function findWriter(writers) {
  function isWriter(element, index, array) {
    if (writers) {
      for (var i in writers) {
        if (writers[i] == element.name) {
          return true;
        }
      }
    }
    return false;
  }
  return members.filter(isWriter);
}
</script>

<template>
  <Layout>
    <template #doc-before>
      <p style="color: grey">{{ frontmatter.description }}</p>
    </template>
    <template #doc-footer-before>
      <Writers :members="findWriter(frontmatter.writers)"></Writers>
    </template>
  </Layout>
</template>
