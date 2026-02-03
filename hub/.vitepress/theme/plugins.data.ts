import {createContentLoader} from 'vitepress';
import path from 'node:path';
import {parse} from 'yaml';
import fs from 'node:fs';

type SubCategory = {
	title: string;
	description: string;
	children: {
		title: string;
		description: string;
		repo: string;
		author: string;
		authorUrl: string;
		demo?: string;
		compatibleV0: boolean;
		compatibleV1: boolean;
		compatibleV2: boolean;
	}[];
};

type TopLevelCategory = {
	title: string;
	description: string;
	children: Record<string, SubCategory>;
};

type PluginIndex = Record<string, TopLevelCategory>;


declare const data: PluginIndex;
export {data};

const extractNavigationInfo = (filePath: string) => {
	const categoryFilePath = path.join(__dirname, '..', '..', filePath, '.navigation.yml');
	try {
		const categoryFileContent = fs.readFileSync(categoryFilePath, 'utf-8');
		const categoryData = parse(categoryFileContent);
		const categoryDescription = categoryData.description || '';
		const categoryTitle = categoryData.title || '';
		return {
			title: categoryTitle,
			description: categoryDescription,
		};
	} catch (err) {
		// if the file doesn't exist or there's an error parsing it, we can ignore it and use an empty description and title
		console.log(`Could not read navigation file at ${categoryFilePath}:`);
		return {
			title: '',
			description: '',
		};
	}
};

export default createContentLoader('plugins/**/*.md', {
	render: true,
	transform(raw): PluginIndex {

		return raw.reduce((acc, data) => {
			const parsedUrl = path.parse(data.url);
			const subCategoryPath = parsedUrl.dir;
			const subCategoryBaseName = path.basename(parsedUrl.dir);
			const topLevelCategoryPath = path.dirname(parsedUrl.dir);
			const topLevelCategoryBaseName = path.basename(path.dirname(parsedUrl.dir));

			if (!acc[topLevelCategoryBaseName]) {
				const {description, title} = extractNavigationInfo(topLevelCategoryPath);
				acc[topLevelCategoryBaseName] = {
					title,
					description,
					children: {},
				};
			}

			if (!acc[topLevelCategoryBaseName].children[subCategoryBaseName]) {
				const {description, title} = extractNavigationInfo(subCategoryPath);
				acc[topLevelCategoryBaseName].children[subCategoryBaseName] = {
					title,
					description,
					children: [],
				};
			}

			acc[topLevelCategoryBaseName].children[subCategoryBaseName].children.push({
				title: data.frontmatter.name,
				repo: data.frontmatter.repo,
				author: data.frontmatter.author,
				authorUrl: data.frontmatter['author-url'],
				demo: data.frontmatter.demo,
				compatibleV0: data.frontmatter['compatible-v0'],
				compatibleV1: data.frontmatter['compatible-v1'],
				compatibleV2: data.frontmatter['compatible-v2'],
				description: data.html || '',
			});
			return acc;

		}, {} as PluginIndex);
	}
});
