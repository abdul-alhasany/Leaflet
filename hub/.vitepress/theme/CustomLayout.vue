<template>
  <Layout>
    <template #doc-before>
      <h2>{{ frontmatter.title }}</h2>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>