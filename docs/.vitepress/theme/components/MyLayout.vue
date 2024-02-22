<script setup>
import DefaultTheme from "vitepress/theme";
import Writers from "./Writers.vue";
import { useData } from "vitepress";
const { frontmatter } = useData();
const { Layout } = DefaultTheme;

const members = [
  {
    avatar: "/github/AW-CRK14.png",
    name: "AW-CRK14",
    title: "发起者",
    links: [{ icon: "github", link: "https://github.com/AW-CRK14" }],
  },
  {
    avatar: "/github/kitUIN.png",
    name: "kitUIN",
    title: "贡献者",
    links: [{ icon: "github", link: "https://github.com/kitUIN" }],
  },
];

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
