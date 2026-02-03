<script setup lang="ts">
import {data as plugins} from './plugins.data.js';
</script>

<template>
  <div class="divide-y divide-gray-200 dark:divide-slate-200/5">
    <!-- <pre>{{ plugins }}</pre> -->
    <div
      v-for="(pluginTopCategory, pluginIndex) of plugins"
      :key="pluginIndex"
      class="py-12"
    >
      <h2>{{ pluginTopCategory.title }}</h2>
      <p class="mt-2 text-gray-700 dark:text-slate-300">
        {{ pluginTopCategory.description }}
      </p>

      <div
        v-for="(pluginSubCategory, subCategoryIndex) of pluginTopCategory.children"
        :key="subCategoryIndex"
        class="mt-8"
      >
        <h3 class="text-2xl font-bold mb-4">
          {{ pluginSubCategory.title }}
        </h3>
        <p class="mt-2 text-gray-700 dark:text-slate-300">
          {{ pluginSubCategory.description }}
        </p>
        <table>
          <thead>
            <tr>
              <th class="text-left p-2">
                Plugin
              </th>
              <th class="text-left p-2">
                Description
              </th>
              <th class="text-left p-2">
                V1
              </th>
              <th class="text-left p-2">
                V2
              </th>
              <th class="text-left p-2">
                Demo
              </th>
              <th class="text-left p-2">
                Maintainer
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(plugin, pluginIdx) of pluginSubCategory.children"
              :key="pluginIdx"
              class="border-t border-gray-200 dark:border-slate-200/5"
            >
              <td class="p-2">
                <a
                  :href="plugin.repo"
                  class="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ plugin.title }}
                </a>
              </td>
              <td class="p-2" v-html="plugin.description" />
              <td class="p-2">
                {{ plugin.compatibleV1 ? '✅' : '❌' }}
              </td>
              <td class="p-2">
                {{ plugin.compatibleV2 ? '✅' : '❌' }}
              </td>
              <td class="p-2">
                <a
                  v-if="plugin.demo"
                  :href="plugin.demo"
                  class="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Demo
                </a>
                <span v-else>—</span>
              </td>
              <td class="p-2">
                <a
                  v-if="plugin.authorUrl"
                  :href="plugin.authorUrl"
                  class="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ plugin.author }}
                </a>
                <span v-else>{{ plugin.author }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- <div class="">
          <div
            v-for="(plugin, pluginIdx) of pluginSubCategory.children"
            :key="pluginIdx"
            class=""
          >
            <div>
              {{ plugin }}
            </div>
            <div v-html="plugin.description" />
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>
