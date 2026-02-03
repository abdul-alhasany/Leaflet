import {defineConfig} from 'vitepress';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'Leaflet Hub',
	description: 'Leaflet blog, api reference and documentation',
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{text: 'Blog', link: '/blog'},
			{text: 'Examples', link: '/markdown-examples'}
		],
		sidebar: {
			'/blog': [],
			'/':[
				{text: 'Examples', link: '/markdown-examples'},
				{text: 'Blog', link: '/blog/'},
				{text: 'API Reference', link: '/api-examples'},
				{text: 'Documentation', link: '/docs'},
			],
		},
		socialLinks: [
			{icon: 'github', link: 'https://github.com/vuejs/vitepress'}
		],
	},
	vite: {
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('../', import.meta.url)),
			},
		},
		plugins: [tailwindcss()],
	},
});
