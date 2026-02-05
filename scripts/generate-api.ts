
import LeafDoc from 'leafdoc';
import {writeFile} from 'fs-extra';
import path from 'path';

type DocId = string;

interface RootDoc {
	[key: string]: ClassDoc;
}

type SuperSectionKeys = 'option' | 'example' | 'constructor' | 'event' | 'method' | 'property' | 'pane';
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

const generateOptions = (optionSection?: SuperSection) => {
	if (!optionSection) {
		return '';
	}
	let optionsContent = '### Options\n\n';

	const sortedOptions = Object.values(optionSection.sections).toSorted((a, b) => a.name.localeCompare(b.name));
	for (const option of sortedOptions) {
		if (option.name !== '__default') {
			optionsContent += `#### ${option.name}\n`;
		}
		if (option.comments.length) {
			optionsContent += `${option.comments.join('\n')}\n`;
		}
		optionsContent += '| Option | Type | Default | Description |\n';
		optionsContent += '| --- | --- | --- | --- |\n';
		for (const optionDoc of Object.values(option.documentables)) {
			const {name, type, defaultValue, comments} = optionDoc;
			optionsContent += `| ${name} | ${type || 'unknown'} | ${defaultValue ?? 'none'} | ${comments.join('')} |\n`;
		}
	}
	return optionsContent;
};

const generateEvents = (eventSection?: SuperSection) => {
	if (!eventSection) {
		return '';
	}

	let eventsContent = '### Events\n\n';
	for (const event of Object.values(eventSection.sections)) {
		if (event.name !== '__default') {
			eventsContent += `#### ${event.name}\n`;
		}
		eventsContent += '| Event | Data | Description |\n';
		eventsContent += '| --- | --- | --- |\n';
		for (const eventDoc of Object.values(event.documentables)) {
			const {name, comments, type} = eventDoc;
			eventsContent += `| ${name} | ${type} | ${comments.join(' ')} |\n`;
		}

	}
	return eventsContent;
};

const generateMethods = (methodSection?: SuperSection) => {
	if (!methodSection) {
		return '';
	}

	let methodsContent = '### Methods\n\n';
	const sortedMethods = Object.values(methodSection.sections).toSorted((a, b) => a.name.localeCompare(b.name));
	for (const method of sortedMethods) {
		if (method.name !== '__default') {
			methodsContent += `#### ${method.name}\n`;
		}
		methodsContent += '| Method | Description |\n';
		methodsContent += '| --- | --- |\n';
		for (const methodDoc of Object.values(method.documentables)) {
			const {name, comments, type, params} = methodDoc;
			const paramsString = Object.values(params).map((param) => {
				const safeParamType = param.type?.replace(/\|/g, '\\|');
				return `\\<${safeParamType}> _${param.name}_`;
			}).join(', ');

			const methodSignature = `.${name}(${paramsString}): ${type || 'void'}`;

			methodsContent += `| ${methodSignature} | ${comments.join(' ')} |\n`;
		}
	}
	return methodsContent;
};

const generateProperties = (propertySection?: SuperSection) => {
	if (!propertySection) {
		return '';
	}

	let propertiesContent = '### Properties\n\n';
	const sortedProperties = Object.values(propertySection.sections).toSorted((a, b) => a.name.localeCompare(b.name));
	for (const property of sortedProperties) {
		if (property.name !== '__default') {
			propertiesContent += `#### ${property.name}\n`;
		}
		propertiesContent += '| Property | Type | Description |\n';
		propertiesContent += '| --- | --- | --- |\n';
		for (const propertyDoc of Object.values(property.documentables)) {
			const {name, comments, type} = propertyDoc;
			propertiesContent += `| ${name} | ${type || 'unknown'} | ${comments.join(' ')} |\n`;
		}
	}
	return propertiesContent;
};

const generatePanes = (paneSection?: SuperSection) => {
	if (!paneSection) {
		return '';
	}

	let panesContent = '### Panes\n\n';
	for (const pane of Object.values(paneSection.sections)) {
		panesContent += `${pane.comments.join('\n')  }\n`;
		panesContent += '| Pane | Type | z-index | Description |\n';
		panesContent += '| --- | --- | --- | --- |\n';
		for (const paneDoc of Object.values(pane.documentables)) {
			const {name, comments, defaultValue, type} = paneDoc;
			panesContent += `| ${name} | ${type} | ${defaultValue} | ${comments.join(' ')} |\n`;
		}
	}
	return panesContent;
};

const generateExample = (exampleSection?: SuperSection) => {
	if (!exampleSection) {
		return '';
	}

	let exampleContent = '### Examples\n\n';
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

const generateConstructor = (constructorSection?: SuperSection) => {
	if (!constructorSection || !constructorSection.sections) {
		return '';
	}
	let constructorContent = '### Constructor\n\n';
	for (const constructor of Object.values(constructorSection.sections)) {
		const constructorData = constructor.documentables;
		if (!constructorData) {
			continue;
		}

		const overloads = Object.values(constructorData);
		constructorContent += '| Factory | Description |\n';
		constructorContent += '| --- | --- |\n';
		for (const overload of overloads) {
			const {name, comments, params} = overload;
			const paramsString = Object.values(params).map((param) => {
				const safeParamType = param.type?.replace(/\|/g, '\\|');
				return `\\<${safeParamType}> _${param.name}_`;
			}).join(', ');

			const constructor = `L.${name}(${paramsString})`;

			constructorContent += `| ${constructor} | ${comments.join(' ')} |\n`;
		}
	}
	return constructorContent;
};

let markdownContent = '---\n';
// markdownContent += 'outline: [2]\n';
markdownContent += '---\n\n';
markdownContent += '<!-- This file is auto-generated with the script "scripts/generate-api.ts" -->\n\n';
markdownContent += '# API Reference\n\n';
for (const classDoc of Object.values(json)) {
	const {id, comments} = classDoc;
	markdownContent += `## ${classDoc.name}\n`;
	if (comments.length) {
		markdownContent += `${comments.join('\n')}\n`;
	}
	markdownContent += generateExample(classDoc.supersections.example);
	markdownContent += generateConstructor(classDoc.supersections.constructor);
	markdownContent += generateOptions(classDoc.supersections.option);
	markdownContent += generateEvents(classDoc.supersections.event);
	markdownContent += generateMethods(classDoc.supersections.method);
	markdownContent += generateProperties(classDoc.supersections.property);
	markdownContent += generatePanes(classDoc.supersections.pane);
	console.log(`Generated docs for class: ${id}`);

}
await writeFile(path.join(apiDataPath, 'index.md'), markdownContent);
