import {defineConfig} from 'vitepress';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';
import pluginsSidebar from './plugins-sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'Leaflet Hub',
	description: 'Leaflet blog, api reference and documentation',
	head: [
		[
			'link',
			{rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'}
		],
		[
			'link',
			{rel: 'preconnect', href: 'https://unpkg.com'}
		],
		[
			'script',
			{src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=', crossorigin: 'anonymous'}
		]
	],
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		logo: './logo.png',
		search: {
			provider: 'local'
		},
		nav: [
			{text: 'Blog', link: '/blog'},
			{text: 'Plugins', link: '/plugins'}
		],
		sidebar: {
			'/blog': [],
			'/plugins': pluginsSidebar,
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
