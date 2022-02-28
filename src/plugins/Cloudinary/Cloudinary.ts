import {
	MinimalPlugin,
	type MinimalPluginSettings,
	type UnknownObject,
} from 'plugins/Shared';

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

	override onload(): void {
		this.settings = this.loadSettings(isCloudinarySettings);

		console.log('Cloudinary load');
	}

	displaySettings(containerEl: HTMLElement): void {
		containerEl.createDiv({ text: 'Cloudinary' });
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
