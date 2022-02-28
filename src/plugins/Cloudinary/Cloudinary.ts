import { Setting } from 'obsidian';
import {
	MinimalPlugin,
	type MinimalPluginSettings,
	type UnknownObject,
} from 'plugins/Shared';
import { cloudinaryApi, type CloudinaryApi } from './CloudinaryApi';

interface CloudinarySettings extends MinimalPluginSettings {
	cloudName: string;
	apiKey: string;
	apiSecret: string;
}

export const DEFAULT_SETTINGS: CloudinarySettings = {
	cloudName: '',
	apiKey: '',
	apiSecret: '',
};

export class Cloudinary extends MinimalPlugin {
	settings: CloudinarySettings = DEFAULT_SETTINGS;
	api: CloudinaryApi = cloudinaryApi;

	override onload(): void {
		this.settings = this.loadSettings(isCloudinarySettings);
		this.setApiConfig();
		console.log('Cloudinary load');

		this.addCommand({
			id: 'cloudinary-upload',
			name: 'Upload from clipboard to Cloudinary',
			callback: async () => {
				const filePath = await navigator.clipboard.readText();
				this.api.upload(filePath, (err, result) => {
					console.log(err, result);
					if (!result?.secure_url) return;
					navigator.clipboard.writeText(`![](result.secure_url)`);
				});
			},
		});
	}

	displaySettings(containerEl: HTMLElement): void {
		let cloudName: string;
		new Setting(containerEl)
			.setName('Cloud name')
			.addText((component) => {
				component.onChange((value) => {
					cloudName = value;
				});
			})
			.addButton((component) => {
				component.setButtonText('Save').onClick(() => {
					this.settings.cloudName = cloudName;
					this.requestSaveSettings();
				});
			});

		let apiKeyInputEl: HTMLInputElement;
		let apiKey: string;
		new Setting(containerEl)
			.setName('API key')
			.addText((component) => {
				apiKeyInputEl = component.inputEl;
				component.onChange((value) => {
					apiKey = value;
				});
			})
			.addButton((component) => {
				component.setButtonText('Save').onClick(() => {
					this.settings.apiKey = apiKey;
					apiKeyInputEl.value = '';
					this.requestSaveSettings();
				});
			});

		let apiSecretInputEl: HTMLInputElement;
		let apiSecret: string;
		new Setting(containerEl)
			.setName('API secret')
			.addText((component) => {
				apiSecretInputEl = component.inputEl;
				component.onChange((value) => {
					apiSecret = value;
				});
			})
			.addButton((component) => {
				component.setButtonText('Save').onClick(() => {
					this.settings.apiSecret = apiSecret;
					apiSecretInputEl.value = '';
					this.requestSaveSettings();
				});
			});
	}

	private setApiConfig() {
		const { cloudName, apiKey, apiSecret } = this.settings;
		this.api.config({
			cloud_name: cloudName,
			api_key: apiKey,
			api_secret: apiSecret,
		});
	}
}

function isCloudinarySettings(obj: unknown): obj is CloudinarySettings {
	if (typeof obj !== 'object') return false;
	if (obj === null) return false;

	const { cloudName, apiKey, apiSecret } =
		obj as UnknownObject<CloudinarySettings>;
	if (typeof cloudName !== 'string') return false;
	if (typeof apiKey !== 'string') return false;
	if (typeof apiSecret !== 'string') return false;
	return true;
}
