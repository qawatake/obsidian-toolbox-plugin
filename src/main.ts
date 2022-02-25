import { Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	ToolboxPluginSettingTab,
	type ToolboxPluginSettings,
} from 'Setting';
import { deepMerge } from 'utils/Util';

export default class ToolboxPlugin extends Plugin {
	settings: ToolboxPluginSettings | undefined;

	override async onload() {
		await this.loadSettings();

		this.addSettingTab(new ToolboxPluginSettingTab(this.app, this));
	}

	// override onunload() {}

	async loadSettings() {
		this.settings = deepMerge(DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
