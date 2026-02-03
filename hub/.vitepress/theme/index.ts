// https://vitepress.dev/guide/custom-theme
import type {Theme} from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import BlogIndex from './BlogIndex.vue';
import BlogPost from './BlogPost.vue';
import PluginsIndex from './PluginsIndex.vue';
import CustomLayout from './CustomLayout.vue';
import './style.css';

export default {
	extends: DefaultTheme,
	Layout: CustomLayout,
	enhanceApp({app, router, siteData}) {
		app.component('BlogIndex', BlogIndex);
		app.component('Post', BlogPost);
		app.component('PluginsIndex', PluginsIndex);
	}
} satisfies Theme;
