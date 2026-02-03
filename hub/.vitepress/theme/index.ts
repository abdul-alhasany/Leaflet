// https://vitepress.dev/guide/custom-theme
import {h} from 'vue';
import type {Theme} from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './style.css';
import BlogIndex from './BlogIndex.vue';
import BlogPost from './BlogPost.vue';

export default {
	extends: DefaultTheme,
	Layout: () => h(DefaultTheme.Layout, null, {
		// https://vitepress.dev/guide/extending-default-theme#layout-slots
	}),
	enhanceApp({app, router, siteData}) {
		app.component('BlogIndex', BlogIndex);
		app.component('Post', BlogPost);
	}
} satisfies Theme;
