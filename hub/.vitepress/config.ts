import {defineConfig} from 'vitepress';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';
import pluginsSidebar from './plugins-sidebar.js';

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
		],
		[
			'script',
			{},
			`
    	ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
		MB_ATTR = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
		MB_URL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + ACCESS_TOKEN;
		OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
		OSM_ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      `
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
	// @todo remove later to enforce proper links
	ignoreDeadLinks: true,
});
