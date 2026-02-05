<script setup lang="ts">
import {withBase} from 'vitepress';
import {data as posts} from './blog.data.js';
</script>

<template>
  <div class="divide-y divide-gray-200 dark:divide-slate-200/5">
    <div
      v-for="(blogPost, blogIndex) of posts"
      :key="blogIndex"
      class="py-12"
    >
      <article
        class="space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline"
      >
        <div class="text-gray-500 dark:text-gray-300 font-medium">
          {{ blogPost.date.string }}
        </div>
        <div class="space-y-5 xl:col-span-3">
          <div class="space-y-6">
            <h2 class="mt-0! border-t-0!">
              <a :href="withBase(blogPost.url)">{{ blogPost.title }}</a>
            </h2>
            <div
              v-if="blogPost.excerpt"
              v-html="blogPost.excerpt"
            />
          </div>
          <div class="text-base leading-6 font-medium">
            <a
              class="link"
              aria-label="read more"
              :href="withBase(blogPost.url)"
            >Read more →</a>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
