import {
	App,
	Command,
	Editor,
	KeymapContext,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TAbstractFile,
	TFile,
} from 'obsidian';
import { AppExtension } from './uncover';
import { ExampleView, VIEW_TYPE_EXAMPLE } from 'view';
import { ExampleModal } from 'Modal';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		const app = this.app as AppExtension;
		console.log(app);

		this.registerView(VIEW_TYPE_EXAMPLE, (leaf) => new ExampleView(leaf));
		this.addRibbonIcon('dice', 'Activate view', () => {
			this.activateView();
		});

		// const command = await this.waitUntilCommandsFound();
		// console.log(command);

		await this.loadSettings();

		this.addCommand({
			id: 'qawatake-switcher-show-preview',
			name: 'Show preview',
			callback: () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					return;
				}
			},
		});

		this.addCommand({
			id: 'display-modal',
			name: 'Display modal',
			callback: () => {
				new ExampleModal(this.app).open();
			},
		});
	}

	onunload() {}

	async onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_EXAMPLE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
		);
	}

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

	async waitUntilCommandsFound(): Promise<Command> {
		const app = this.app as AppExtension;
		for (let i = 0; i < 100; i++) {
			const command = app.commands.commands['command-palette:open'];
			if (command) {
				console.log(i);
				return command;
			}
			await new Promise((s) => {
				setTimeout(s, 1);
			});
		}
		return Promise.reject('timeout: failed to load commands');
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder('Enter your secret')
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log('Secret: ' + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
