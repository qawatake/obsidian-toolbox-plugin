import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, type MyPluginSettings } from 'Setting';

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings | undefined;

	override async onload() {
		await this.loadSettings();
	}

	// override onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
