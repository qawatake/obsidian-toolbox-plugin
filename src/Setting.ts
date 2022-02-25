import type ToolboxPlugin from 'main';
import { MINIMAL_PLUGIN_GENERATORS } from 'plugins/MinimalPlugin';
import { App, PluginSettingTab, Setting } from 'obsidian';

export interface ToolboxPluginSettings {
	minimalPlugins: MinimalPluginMap;
}

type MinimalPluginMap = {
	[id in string]: boolean;
};

export function defaultSettings(): ToolboxPluginSettings {
	const settings: ToolboxPluginSettings = { minimalPlugins: {} };
	Object.keys(MINIMAL_PLUGIN_GENERATORS).forEach((id) => {
		settings.minimalPlugins[id] = false;
	});
	return settings;
}

export class ToolboxPluginSettingTab extends PluginSettingTab {
	private readonly plugin: ToolboxPlugin;

	constructor(app: App, plugin: ToolboxPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();
		const { settings } = this.plugin;
		if (!settings) return;

		containerEl.createEl('h2', { text: 'Minimal Plugins' });
		Object.keys(MINIMAL_PLUGIN_GENERATORS).forEach((id) => {
			new Setting(containerEl).setName(id).addToggle((component) => {
				component
					.setValue(settings.minimalPlugins[id] ?? false)
					.onChange(async (value) => {
						settings.minimalPlugins[id] = value;
						if (value) {
							this.plugin.enableMinimalPlugin(id);
						} else {
							this.plugin.disableMinimalPlugin(id);
						}
						await this.plugin.saveSettings();
					});
			});
		});
	}
}
