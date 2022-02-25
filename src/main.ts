import { MINIMAL_PLUGIN_GENERATORS } from 'plugins/MinimalPlugin';
import type { MinimalPlugin } from 'plugins/Shared';

import { Plugin } from 'obsidian';
import {
	defaultSettings,
	ToolboxPluginSettingTab,
	type ToolboxPluginSettings,
} from 'Setting';
import { deepMerge } from 'utils/Util';

export default class ToolboxPlugin extends Plugin {
	settings: ToolboxPluginSettings | undefined;
	minimalPlugins: {
		[id: string]: MinimalPlugin;
	} = {};

	override async onload() {
		await this.loadSettings();

		this.loadMinimalPlugins();

		this.addSettingTab(new ToolboxPluginSettingTab(this.app, this));
	}

	// override onunload() {}

	private async loadSettings() {
		this.settings = deepMerge(defaultSettings(), await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	enableMinimalPlugin(id: string) {
		const generator = MINIMAL_PLUGIN_GENERATORS[id];
		if (!generator) return;
		this.disableMinimalPlugin(id);
		const minimalPlugin = new generator();
		this.minimalPlugins[id] = minimalPlugin;
		this.addChild(minimalPlugin);
	}

	disableMinimalPlugin(id: string) {
		const minimalPlugin = this.minimalPlugins[id];
		if (minimalPlugin) {
			this.removeChild(minimalPlugin);
			delete this.minimalPlugins[id];
		}
	}

	private loadMinimalPlugins() {
		Object.keys(MINIMAL_PLUGIN_GENERATORS).forEach((id) => {
			const ok = this.settings?.minimalPlugins[id];
			if (ok) {
				this.enableMinimalPlugin(id);
			}
		});
	}
}
