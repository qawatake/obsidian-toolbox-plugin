import type ToolboxPlugin from 'main';
import { MINIMAL_PLUGIN_LIST } from 'plugins/MinimalPlugin';
import { App, PluginSettingTab, Setting } from 'obsidian';

export interface ToolboxPluginSettings {
	minimalPlugins: MinimalPluginMap;
}

type MinimalPluginMap = {
	[id in string]: {
		on: boolean;
		data: Record<string, unknown>;
	};
};

export function defaultSettings(): ToolboxPluginSettings {
	const settings: ToolboxPluginSettings = { minimalPlugins: {} };
	Object.keys(MINIMAL_PLUGIN_LIST).forEach((id) => {
		const info = MINIMAL_PLUGIN_LIST[id];
		if (!info) return;
		settings.minimalPlugins[id] = {
			on: false,
			data: info.defaultData,
		};
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
		Object.keys(MINIMAL_PLUGIN_LIST).forEach((id) => {
			const info = MINIMAL_PLUGIN_LIST[id];
			if (!info) return;
			const { description } = info;
			new Setting(containerEl)
				.setName(description)
				.addToggle((component) => {
					component
						.setValue(settings.minimalPlugins[id]?.on ?? false)
						.onChange(async (value) => {
							const minimalPlugin = settings.minimalPlugins[id];
							if (minimalPlugin === undefined) return;
							minimalPlugin.on = value;
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
