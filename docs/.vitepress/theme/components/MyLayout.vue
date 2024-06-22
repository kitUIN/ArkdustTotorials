<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import Writers from "./Writers.vue";
import { VersionLink } from "./VersionBadge.vue";
import { Version } from "./VersionBox.vue";
import VersionLine from "./VersionLine.vue";
import { useData, useRoute } from "vitepress";
import { data } from "../datas/members.data";
import { data as posts } from "../datas/posts.data";
const members = data.members;
const { Layout } = DefaultTheme;

const { frontmatter } = useData();

// type LVersion = {
//   id?:string;
//   vanilla?: Version;
//   loaders?: Array<Version>;
//   others?: Array<Version>;
// };
function checkVersion(elements: Array<VersionLink>, text: string) {
  if (elements) {
    let check = true;
    elements.forEach((element) => {
      if (element.text == text) check = false;
    });
    return check;
  }
  return false;
}
function loadsVersion(
  frontmatter: {
    versions: { id: any; vanilla: any; loaders: any[]; others: any[] };
  },
  posts: any[]
) {
  const { path } = useRoute();
  // console.log(path);
  const versions: Array<Version> = [];
  if (frontmatter.versions) {
    const vanillas: Array<VersionLink> = [];
    const loaders = {
      fabric: [],
      neoforge: [],
      forge: [],
      quilt: [],
      vanilla: [],
    };
    const others = {};
    if (frontmatter.versions.id) {
      posts?.forEach(
        (element: {
          frontmatter: {
            versions: {
              id: any;
              vanilla: string;
              loaders: any[];
              others: any[];
            };
          };
          url: string;
        }) => {
          if (
            element.frontmatter.versions &&
            element.frontmatter.versions.id &&
            element.frontmatter.versions.id === frontmatter.versions.id &&
            path !== element.url // 不能是自己页面的
          ) {
            if (checkVersion(vanillas, element.frontmatter.versions.vanilla)) {
              vanillas.push({
                text: element.frontmatter.versions.vanilla,
                loader: "vanilla",
                link: element.url,
              });
            }
            if (element.frontmatter.versions) {
              if (element.frontmatter.versions.loaders) {
                element.frontmatter.versions.loaders.forEach(
                  (ele: { loader: string; text: string; link: any }) => {
                    if (
                      ele.loader &&
                      ele.loader != "vanilla" &&
                      checkVersion(loaders[ele.loader], ele.text)
                    ) {
                      ele.link = element.url;
                      loaders[ele.loader].push(ele);
                    }
                  }
                );
              }
              if (element.frontmatter.versions.others) {
                element.frontmatter.versions.others.forEach(
                  (ele: VersionLink) => {
                    if (ele.id) {
                      if (others[ele.id] === undefined) {
                        // 不存在先创建
                        others[ele.id] = [];
                      }
                      if (checkVersion(others[ele.id], ele.text ?? "")) {
                        ele.link = element.url;
                        others[ele.id].push(ele);
                      }
                    }
                  }
                );
              }
            }
          }
        }
      );
    }
    if (frontmatter.versions.vanilla) {
      versions.push({
        current: {
          text: frontmatter.versions.vanilla,
          loader: "vanilla",
        },
        others: vanillas,
      });
    }
    if (frontmatter.versions.loaders)
      frontmatter.versions.loaders.forEach((element: VersionLink) => {
        versions.push({
          current: element,
          others: loaders[element.loader ?? ""],
        });
      });
    if (frontmatter.versions.others)
      frontmatter.versions.others.forEach((element: VersionLink) => {
        versions.push({ current: element, others: others[element.id ?? ""] });
      });
  }
  // console.log(versions);
  return versions;
}
function findWriter(writers: { [x: string]: any }) {
  function isWriter(element: { name: any }, index: any, array: any) {
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
      <VersionLine :versions="loadsVersion(frontmatter, posts)"></VersionLine>
      <p style="color: grey">{{ frontmatter.description }}</p>
    </template>
    <template #doc-footer-before>
      <Writers :members="findWriter(frontmatter.writers)"></Writers>
    </template>
  </Layout>
</template>
