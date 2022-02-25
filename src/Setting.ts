import type ToolboxPlugin from 'main';
import { App, SettingTab } from 'obsidian';

export interface ToolboxPluginSettings {
	minimalPlugins: MinimalPluginMap;
}

export const DEFAULT_SETTINGS: ToolboxPluginSettings = {
	minimalPlugins: {},
};

type MinimalPluginMap = {
	[pluginId: string]: boolean;
};

export class ToolboxPluginSettingTab extends SettingTab {
	private readonly plugin: ToolboxPlugin;

	constructor(app: App, plugin: ToolboxPlugin) {
		super();
		this.app = app;
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();
	}
}
