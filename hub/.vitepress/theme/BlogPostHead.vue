<template>
  <div>
    <h2>{{ frontmatter.title }}</h2>
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
const { page, frontmatter } = useData()
console.log('BlogPostHead component loaded', page, frontmatter);
</script>

<style scoped>

</style>