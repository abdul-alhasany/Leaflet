import {createContentLoader} from 'vitepress';

interface Post {
	title: string
	url: string
	date: {
		raw: string
		string: string
	}
	excerpt: string | undefined
}

declare const data: Post[];
export {data};

const extractDateFromUrl = (url: string): string => {
	const match = url.match(/\/blog\/(\d{4}-\d{2}-\d{2})-/);
	return match ? match[1] : '';
};

export default createContentLoader('blog/*.md', {
	excerpt: false,
	transform(raw): Post[] {
		return raw
			.map((data) => {
				const {url, frontmatter, excerpt} = data;
				return {
					title: frontmatter.title,
					url,
					excerpt: frontmatter.description || '',
					date: formatDate(extractDateFromUrl(url))
				};
			})
			.sort((a, b) => b.date.raw.localeCompare(a.date.raw));
	}
});

function formatDate(raw: string): Post['date'] {
	const date = new Date(raw);
	date.setUTCHours(12);
	return {
		raw,
		string: date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	};
}
