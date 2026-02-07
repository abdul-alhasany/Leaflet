
import LeafDoc from 'leafdoc';
import {writeFile} from 'fs-extra';
import path from 'path';

type DocId = string;

interface RootDoc {
	[key: string]: ClassDoc;
}

type SuperSectionKeys = 'option' | 'example' | 'constructor' | 'event' | 'method' | 'function' | 'property' | 'pane';
interface ClassDoc {
	name: string;
	aka: string[];
	comments: string[];
	supersections: Record<SuperSectionKeys, SuperSection>;
	inherits: string[];
	relationships: unknown[];
	id: DocId;
}

interface SuperSection {
	name: string;
	aka: string[];
	comments: string[];
	sections: Record<string, Section>;
	id: DocId;
}

interface Section {
	name: string;
	aka: string[];
	comments: string[];
	uninheritable: boolean;
	documentables: Record<string, Documentable>;
	type: string;
	id: DocId;
}

interface Documentable {
	name: string;
	aka: string[];
	comments: string[];
	params: Record<string, Param>;
	type: string | null;
	optional: boolean;
	defaultValue: string | number | boolean | null;
	id?: DocId;
}

interface Param {
	name: string;
	type?: string;
}

type TableRow = (string | boolean | number)[];
console.log('Building Leaflet documentation with Leafdoc ...');

const doc = new LeafDoc({
	templateDir: 'build/leafdoc-templates',
	showInheritancesWhenEmpty: true,
	leadingCharacter: '@'
});

// Note to Vladimir: Iván's never gonna uncomment the following line. He's
// too proud of the little leaves around the code.
// doc.setLeadingChar('@');

// Leaflet uses a couple of non-standard documentable things. They are not
// important enough to be classes/namespaces of their own, and should
// just be listed in a table like the rest of documentables:
doc.registerDocumentable('pane', 'Map panes');
doc.registerDocumentable('projection', 'Defined projections');
doc.registerDocumentable('crs', 'Defined CRSs');

doc.addFile('build/docs-index.leafdoc', false);
doc.addDir('src');
doc.addFile('build/docs-misc.leafdoc', false);

// const out = doc.outputStr();
const outputPath = './output.json';
const apiDataPath = path.join(__dirname, '../hub/api');
const json: RootDoc = JSON.parse(doc.outputJSON());

// taken from https://github.com/valeriangalliat/markdown-it-anchor/blob/master/index.js#L3
const slugify = (string: string) => encodeURIComponent(String(string).trim().toLowerCase().replace(/\s+/g, '-'));

class ApiDocumentation {
	className: string;
	classData : ClassDoc;
	inherits: ApiDocumentation[];
	markdownContent: string = '';
	methods: Section[] = [];
	functions: Section[] = [];
	events: Section[] = [];
	properties: Section[] = [];
	options: Section[] = [];
	panes: Section[] = [];

	constructor(classData: ClassDoc) {
		this.className = classData.name;
		this.classData = classData;
		this.inherits = classData.inherits.map(inheritName => new ApiDocumentation(json[inheritName]));

		const {comments} = classData;
		this.markdownContent += `## ${this.classData.name}\n`;
		if (comments.length) {
			this.markdownContent += `${comments.join('\n')}\n`;
		}

		this.getClassProperties();
	}

	getClassProperties() {
		const {method, function: functionSection, event, property, option, pane} = this.classData.supersections;
		if (method) {
			this.methods = Object.values(method.sections).toSorted((a, b) => a.name.localeCompare(b.name));
		}

		if (functionSection) {
			this.functions = Object.values(functionSection.sections).toSorted((a, b) => a.name.localeCompare(b.name));
		}

		if (event) {
			this.events = Object.values(event.sections).toSorted((a, b) => a.name.localeCompare(b.name));
		}

		if (property) {
			this.properties = Object.values(property.sections).toSorted((a, b) => a.name.localeCompare(b.name));
		}

		if (option) {
			this.options = Object.values(option.sections).toSorted((a, b) => a.name.localeCompare(b.name));
		}

		if (pane) {
			this.panes = Object.values(pane.sections).toSorted((a, b) => a.name.localeCompare(b.name));
		}
	}

	createTable(headers: string[], rows: TableRow[]) {
		let table = `| ${headers.join(' | ')} |\n`;
		table += `| ${headers.map(() => '---').join(' | ')} |\n`;
		for (const row of rows) {
			table += `| ${row.join(' | ')} |\n`;
		}
		return table;
	}

	generateParamsString(params: Record<string, Param>) {
		const content = Object.values(params).map((param) => {
			const {name: paramName, type: paramType} = param;
			const safeParamType = paramType ? paramType.replace(/\|/g, '\\|') : '';
			return `<div class="param-definition">${paramName}: ${safeParamType}</div>`;
		}).join('');

		if (content.trim() === '') {
			return content;
		}
		return `${content}`;
	}

	generateConstructor(constructorSection?: SuperSection) {
		if (!constructorSection || !constructorSection.sections) {
			return '';
		}
		let constructorContent = '### Constructor ';
		constructorContent += `{#${slugify(`${this.className}-constructor-list`)}}\n\n`;
		for (const constructor of Object.values(constructorSection.sections)) {
			const constructorData = constructor.documentables;
			if (!constructorData) {
				continue;
			}

			const overloads = Object.values(constructorData);

			const headers = ['Signature', 'Description'];
			const rows: TableRow[] = [];

			for (const overload of overloads) {
				const {name, comments, params} = overload;

				const paramsString = this.generateParamsString(params);
				const constructor = `L.${name}(${paramsString})`;

				rows.push([constructor, comments.join(' ')]);
			}
			constructorContent += this.createTable(headers, rows);
		}

		return constructorContent;
	};

	generateExample(exampleSection?: SuperSection) {
		if (!exampleSection) {
			return '';
		}

		let exampleContent = '### Examples ';
		exampleContent += `{#${slugify(`${this.className}-examples-list`)}}\n\n`;
		for (const example of Object.values(exampleSection.sections)) {
			const exampleData = example.documentables['__default'];
			if (!exampleData) {
				continue;
			}

			if (exampleData.comments.length) {
				exampleContent += `${exampleData.comments.join('\n')}\n`;
			}
		}
		return exampleContent;
	};

	generateEventDocumentable(eventDoc: Documentable[]) {
		const headers = ['Event', 'Data', 'Description'];
		const rows: TableRow[] = [];
		for (const entry of Object.values(eventDoc)) {
			const {name, comments, type} = entry;
			rows.push([name, type || '', comments.join(' ')]);
		}

		return this.createTable(headers, rows);
	}

	generateEventsSection() {
		if (this.events.length === 0) {
			return '';
		}

		let content = '### Events ';
		content += `{#${slugify(`${this.className}-events-list`)}}\n\n`;

		for (const event of Object.values(this.events)) {
			if (event.name !== '__default') {
				content += `#### ${event.name}\n`;
			}

			content += this.generateEventDocumentable(Object.values(event.documentables));
		}
		return content;
	};


	generateOptionsDocumentable(optionDoc: Documentable[]) {
		const headers = ['Option', 'Description'];
		const rows: TableRow[] = [];

		for (const entry of Object.values(optionDoc)) {
			const {name, type, defaultValue, comments} = entry;

			const typeContent = type ? type.replace(/\|/g, '\\|') : '';
			const defaultValueContent = `<span class='default-value'>default: ${defaultValue ?? 'none'}</span>`;
			rows.push([`<div class="option-definition">${name} (${typeContent})</div>${defaultValueContent}`, comments.join(' ')]);
		}

		return this.createTable(headers, rows);
	}

	generateOptionsSection() {
		if (this.options.length === 0) {
			return '';
		}

		let content = '### Options ';
		content += `{#${slugify(`${this.className}-options-list`)}}\n\n`;

		for (const option of Object.values(this.options)) {
			if (option.name !== '__default') {
				content += `#### ${option.name}\n`;
			}

			if (option.comments.length) {
				content += `${option.comments.join('\n')}\n`;
			}

			content += this.generateOptionsDocumentable(Object.values(option.documentables));
		}

		return content;
	};

	generateMethodDocumentable(methodDoc: Documentable[]) {
		const headers = ['Signature', 'Description'];
		const rows: TableRow[] = [];
		for (const entry of Object.values(methodDoc)) {
			const {name, comments, type, params} = entry;

			const paramsString = this.generateParamsString(params);
			const methodSignature = `.${name}(${paramsString}): ${type || 'void'}`;

			rows.push([methodSignature, comments.join(' ')]);
		}

		return this.createTable(headers, rows);
	}

	generateMethodsSection() {
		if (this.methods.length === 0) {
			return '';
		}

		let content = '### Methods ';
		content += `{#${slugify(`${this.className}-methods-list`)}}\n\n`;
		for (const entry of Object.values(this.methods)) {
			if (entry.name !== '__default') {
				content += `#### ${entry.name}\n`;
			}

			content += this.generateMethodDocumentable(Object.values(entry.documentables));
		}
		return content;
	};

	generateFunctionDocumentable(functionDoc: Documentable[]) {
		const headers = ['Signature', 'Description'];
		const rows: TableRow[] = [];
		for (const entry of Object.values(functionDoc)) {
			const {name, comments, type, params} = entry;

			const paramsString = this.generateParamsString(params);
			const functionSignature = `${name}(${paramsString}): ${type || 'void'}`;

			rows.push([functionSignature, comments.join(' ')]);
		}

		return this.createTable(headers, rows);
	}

	generateFunctionsSection() {
		if (this.functions.length === 0) {
			return '';
		}

		let content = '### Functions ';
		content += `{#${slugify(`${this.className}-functions-list`)}}\n\n`;

		for (const entry of Object.values(this.functions)) {
			if (entry.name !== '__default') {
				content += `#### ${entry.name}\n`;
			}

			content += this.generateFunctionDocumentable(Object.values(entry.documentables));
		}
		return content;
	};

	generatePropertyDocumentable(propertyDoc: Documentable[]) {
		const headers = ['Property', 'Description'];
		const rows: TableRow[] = [];
		for (const entry of Object.values(propertyDoc)) {
			const {name, comments, type} = entry;
			const safeType = type ? type.replace(/\|/g, '\\|') : '';
			rows.push([`<div class="property-definition">${name} (${safeType})</div>`, comments.join(' ')]);
		}

		return this.createTable(headers, rows);
	}

	generatePropertiesSection() {
		if (this.properties.length === 0) {
			return '';
		}

		let content = '### Properties ';
		content += `{#${slugify(`${this.className}-properties-list`)}}\n\n`;

		for (const entry of this.properties) {
			if (entry.name !== '__default') {
				content += `#### ${entry.name}\n`;
			}

			content += this.generatePropertyDocumentable(Object.values(entry.documentables));
		}
		return content;
	};

	generatePaneDocumentable(paneDoc: Documentable[]) {
		const headers = ['Pane', 'Description'];
		const rows: TableRow[] = [];
		for (const entry of Object.values(paneDoc)) {
			const {name, comments, type, defaultValue} = entry;
			const safeType = type ? type.replace(/\|/g, '\\|') : '';
			const defaultValueContent = `<span class='default-value'>z-index: ${defaultValue ?? 'none'}</span>`;
			rows.push([`<div class="pane-definition">${name} (${safeType})</div> ${defaultValueContent}`, comments.join(' ')]);
		}

		return this.createTable(headers, rows);
	}

	generatePanesSection() {
		if (this.panes.length === 0) {
			return '';
		}

		let content = '### Panes ';
		content += `{#${slugify(`${this.className}-panes-list`)}}\n\n`;
		for (const pane of Object.values(this.panes)) {
			content += `${pane.comments.join('\n')  }\n`;
			content += this.generatePaneDocumentable(Object.values(pane.documentables));
		}

		return content;
	};

	getOutput() {
		this.markdownContent += this.generateExample(this.classData.supersections.example);
		this.markdownContent += this.generateConstructor(this.classData.supersections.constructor);
		this.markdownContent += this.generateOptionsSection();
		this.markdownContent += this.generateEventsSection();
		this.markdownContent += this.generateMethodsSection();
		this.markdownContent += this.generateFunctionsSection();
		this.markdownContent += this.generatePropertiesSection();
		this.markdownContent += this.generatePanesSection();

		return this.markdownContent;
	}

}

let markdownContent = '---\n';
// markdownContent += 'outline: [2]\n';
markdownContent += '---\n\n';
markdownContent += '<!-- This file is auto-generated with the script "scripts/generate-api.ts" -->\n\n';
markdownContent += '# API Reference\n\n';
for (const classDoc of Object.values(json)) {
	const apiDoc = new ApiDocumentation(classDoc);
	markdownContent += apiDoc.getOutput();
}

// style
markdownContent += '\n<style>\n';
markdownContent += `
.default-value {
	font-size: 0.9em;
	color: var(--text-secondary);
}

.param-definition {
	white-space: nowrap;
	padding-inline-start: 10px;
}

.param-definition:not(:last-child):after {
	content: ',';
}

.option-definition {
	white-space: nowrap;
}

.property-definition {
	white-space: nowrap;
}

.pane-definition {
	white-space: nowrap;
}
`;
markdownContent += '\n</style>\n';

await writeFile(path.join(apiDataPath, 'index.md'), markdownContent);
