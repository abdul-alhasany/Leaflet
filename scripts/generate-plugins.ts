import fs from 'fs-extra';
import path from 'node:path';
import {parse} from 'yaml';

const pluginsDataPath = path.join(__dirname, '../hub/plugins');
const generate = async function (dirPath: string) {
	// Returns an array of filenames and subdirectories as strings
	const topLevelDirectories = await fs.readdir(dirPath, {withFileTypes: true});
	topLevelDirectories.filter(directory => directory.isDirectory()).forEach(async (directory) => {
		console.log(`Processing directory: ${directory.name}`);
		const pluginYamlPath = path.join(dirPath, directory.name, '.navigation.yml');
		if (await fs.pathExists(pluginYamlPath)) {
			const yamlContent = await fs.readFile(pluginYamlPath, 'utf-8');
			const pluginData = parse(yamlContent);
			const outputFilePath = path.join(dirPath, directory.name, 'plugin.json');
			await fs.writeJSON(outputFilePath, pluginData, {spaces: 2});
			console.log(`Generated JSON for plugin: ${directory.name}`);
		} else {
			console.warn(`Warning: plugin.yaml not found in ${directory.name}`);
		}
	});
};

// Example usage:
generate(pluginsDataPath);
