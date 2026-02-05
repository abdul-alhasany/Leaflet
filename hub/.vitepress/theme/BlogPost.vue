<script setup lang="ts">
import {computed} from 'vue';
import {useData, useRoute, withBase} from 'vitepress';
import {data as posts} from './blog.data.js';
const {frontmatter} = useData();
const route = useRoute();

const findCurrentIndex = function () {
    return posts.findIndex(p => withBase(p.url) === route.path);
};

// use the customData date which contains pre-resolved date info
const date = computed(() => posts[findCurrentIndex()].date);
const nextPost = computed(() => posts[findCurrentIndex() - 1]);
const prevPost = computed(() => posts[findCurrentIndex() + 1]);
</script>

<template>
  <div class="pb-24">
    <div class="container mx-auto max-w-[1104px] vp-doc">
      <div class="pt-10">
        <a :href="withBase('/blog')">
          ← Back to the list of blog posts
        </a>
      </div>
      <article>
        <header class="flex flex-col gap-1 pt-8 items-center text-center">
          <div class="text-gray-500 dark:text-gray-300 font-medium">
            {{ date.string }}
          </div>
          <h1 class="font-bold! text-3xl! sm:text-4xl!">
            {{ frontmatter.title }}
          </h1>
          <a
            class="pt-1 block"
            :href="frontmatter.authorsite"
            target="_blank"
          >
            {{ frontmatter.author }}
          </a>
        </header>

        <Content class="prose dark:prose-invert max-w-none pt-10 pb-8" />
      </article>
      <nav class="border-t-(--vp-c-divider) grid gap-2 grid-cols-1 sm:grid-cols-2 mt-16">
        <a
          v-if="prevPost?.url"
          class="flex flex-col gap-1 border border-(--vp-c-divider) rounded-lg p-4 hover:border-(--vp-c-brand-1) transition-colors font-medium no-underline!"
          :href="withBase(prevPost.url)"
        >
          <div class="text-(--vp-c-text-2) text-xs">Previous page</div>
          <div
            class="text-(--vp-c-brand-1) text-sm"
            v-html="prevPost.title"
          />
        </a>
        <a
          v-if="nextPost?.url"
          class="flex flex-col gap-1 border border-(--vp-c-divider) rounded-lg p-4 hover:border-(--vp-c-brand-1) transition-colors text-end font-medium no-underline!"
          :href="withBase(nextPost.url)"
        >
          <div class="text-(--vp-c-text-2) text-xs ">Next page</div>
          <div
            class="text-(--vp-c-brand-1) text-sm"
            v-html="nextPost.title"
          />
        </a>
      </nav>
    </div>
  </div>
</template>
