import { MINIMAL_PLUGIN_LIST } from 'plugins/MinimalPlugin';
import type { MinimalPlugin } from 'plugins/Shared';

import { Plugin } from 'obsidian';
import {
	defaultSettings,
	ToolboxPluginSettingTab,
	type ToolboxPluginSettings,
} from 'Setting';
import { deepMerge } from 'utils/Util';
import { ToolboxEvents } from 'Events';

export default class ToolboxPlugin extends Plugin {
	settings: ToolboxPluginSettings | undefined;
	events: ToolboxEvents | undefined;
	minimalPlugins: {
		[id: string]: MinimalPlugin;
	} = {};

	override async onload() {
		this.settings = await this.loadSettings();
		this.events = new ToolboxEvents();

		this.registerEvent(
			this.events.on('should-save', () => {
				console.log('save!');
				this.saveSettings();
			})
		);

		this.loadMinimalPlugins(this.settings, this.events);

		this.addSettingTab(new ToolboxPluginSettingTab(this.app, this));
	}

	// override onunload() {}

	private async loadSettings(): Promise<ToolboxPluginSettings> {
		return deepMerge(defaultSettings(), await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	enableMinimalPlugin(id: string) {
		const { settings, events } = this;
		if (settings === undefined || events === undefined) {
			throw new Error(
				`[ERROR in Toolbox] failed to fetch settings or events`
			);
		}
		const info = MINIMAL_PLUGIN_LIST[id];
		if (info === undefined) return;
		const data = this.settings?.minimalPlugins[id]?.data;
		const { generator } = info;
		this.disableMinimalPlugin(id);
		const minimalPlugin = new generator(this.app, data, events);
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

	private loadMinimalPlugins(
		_settings: ToolboxPluginSettings,
		_events: ToolboxEvents
	) {
		Object.keys(MINIMAL_PLUGIN_LIST).forEach((id) => {
			const minimalPlugin = this.settings?.minimalPlugins[id];
			if (minimalPlugin?.on) {
				this.enableMinimalPlugin(id);
			}
		});
	}
}
