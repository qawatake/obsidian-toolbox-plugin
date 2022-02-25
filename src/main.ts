import { MINIMAL_PLUGIN_LIST } from 'plugins/MinimalPlugin';
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
		const info = MINIMAL_PLUGIN_LIST[id];
		if (info === undefined) return;
		const { generator } = info;
		this.disableMinimalPlugin(id);
		const minimalPlugin = new generator(this.app);
		this.minimalPlugins[id] = minimalPlugin;
		this.addChild(minimalPlugin);
		this.addMinimalCommands(minimalPlugin);
	}

	disableMinimalPlugin(id: string) {
		const minimalPlugin = this.minimalPlugins[id];
		if (minimalPlugin) {
			this.removeMinimalCommands(minimalPlugin);
			this.removeChild(minimalPlugin);
			delete this.minimalPlugins[id];
		}
	}

	private addMinimalCommands(minimalPlugin: MinimalPlugin) {
		minimalPlugin.listCommands().forEach((cmd) => {
			console.log(cmd.id);
			this.addCommand(cmd);
		});
	}

	private removeMinimalCommands(minimalPlugin: MinimalPlugin) {
		minimalPlugin.listCommands().forEach((cmd) => {
			this.app.commands.removeCommand(cmd.id);
		});
	}

	private loadMinimalPlugins() {
		Object.keys(MINIMAL_PLUGIN_LIST).forEach((id) => {
			const ok = this.settings?.minimalPlugins[id];
			if (ok) {
				this.enableMinimalPlugin(id);
			}
		});
	}
}
