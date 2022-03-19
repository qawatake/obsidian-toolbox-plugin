import { Notice, Setting } from 'obsidian';
import {
	MinimalPlugin,
	type MinimalPluginSettings,
	type UnknownObject,
} from 'plugins/Shared';
import {
	CloudinaryDirectApi,
	type CloudinaryApi,
	type CloudinaryResponseCallback,
	type CloudinaryResponseErrorCallback,
} from './CloudinaryApi';
import { ModalPublicUrl } from './ModalPublicUrl';

interface CloudinarySettings extends MinimalPluginSettings {
	defaultWidth: number;
	defaultFormat: string;
	cloudName: string;
	apiKey: string;
	apiSecret: string;
}

export const DEFAULT_SETTINGS: CloudinarySettings = {
	defaultWidth: 600,
	defaultFormat: 'webp',
	cloudName: '',
	apiKey: '',
	apiSecret: '',
};

export class Cloudinary extends MinimalPlugin {
	settings: CloudinarySettings = DEFAULT_SETTINGS;
	api: CloudinaryApi | undefined;

	override onload(): void {
		this.settings = this.loadSettings(isCloudinarySettings);
		this.setApiConfig();
		console.log('Cloudinary load');

		this.addCommand({
			id: 'cloudinary-upload-dialog',
			name: 'Upload to Cloudinary',
			callback: () => {
				this.showImportDialog();
			},
		});

		this.addCommand({
			id: 'cloudinary-upload-clipboard',
			name: 'Upload to Cloudinary from public URL',
			callback: () => {
				new ModalPublicUrl(this.app, this).open();
			},
		});
	}

	displaySettings(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName('Default width (px)')
			.addText((component) => {
				component
					.setValue(this.settings.defaultWidth.toString())
					.onChange((value) => {
						const width = Number.parseInt(value);
						if (!Number.isInteger(width)) return;
						this.settings.defaultWidth = width;
						this.requestSaveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Default format')
			.addText((component) => {
				component
					.setValue(this.settings.defaultFormat)
					.onChange((value) => {
						const dotTrimmedExtension = value
							.trim()
							.replace(/$\./, '');
						this.settings.defaultFormat = dotTrimmedExtension;
						this.requestSaveSettings();
					});
			});

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
					this.setApiConfig();
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
					this.setApiConfig();
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
					this.setApiConfig();
					this.requestSaveSettings();
				});
			});
	}

	private setApiConfig() {
		const { cloudName, apiKey, apiSecret } = this.settings;
		this.api = new CloudinaryDirectApi({
			cloudName,
			apiKey,
			apiSecret,
		});
	}

	private showImportDialog() {
		const inputEl = createEl('input', { type: 'file' });

		inputEl.multiple = true;
		inputEl.addEventListener('change', async () => {
			const files = inputEl.files;
			this.handleImportedFiles(files);

			inputEl.remove();
		});
		inputEl.click();
	}

	private async handleImportedFiles(files: FileList | null) {
		if (files === null || files.length === 0) {
			return;
		}
		const { api } = this;
		if (!api) return;

		const promises: Promise<void>[] = [];
		const linksToCopy: string[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file === undefined) {
				continue;
			}
			if (!file.type.startsWith('image/')) {
				new Notice(
					`[ERROR in Toolbox]: ${file.name} is not an image file.`
				);
				return;
			}

			promises.push(
				api.upload(
					file,
					{},
					this.onCloudinaryResponseSuccess(linksToCopy),
					this.onCloudinaryResponseError
				)
			);
		}
		await Promise.all(promises);
		await navigator.clipboard.writeText(linksToCopy.join('\n'));
		if (linksToCopy.length === 1) {
			new Notice('Copy link!');
		} else {
			new Notice('Copy links!');
		}
	}

	private onCloudinaryResponseSuccess(
		linksToCopy: string[]
	): CloudinaryResponseCallback {
		return (result) => {
			const gotUrl = result.secure_url;
			const formattedUrl = formatCloudinaryUrl(
				gotUrl,
				this.settings.defaultWidth,
				this.settings.defaultFormat
			);
			const originalFileName = originalFileNameFromPublicId(
				result.public_id
			);
			const link = `![${originalFileName}](${formattedUrl})`;
			linksToCopy.push(link);
			new Notice(`${originalFileName} uploaded!`);
		};
	}

	onCloudinaryResponseError: CloudinaryResponseErrorCallback = (err) => {
		new Notice('[ERROR in Toolbox] failed to upload. See console.');
		console.log('[ERROR in Toolbox] failed to upload.', err.error.message);
	};
}

export function formatCloudinaryUrl(
	originalUrl: string,
	width: number,
	extension: string
): string {
	const url = new URL(originalUrl);
	const splittedPath = url.pathname.split('/');
	const newPath = [
		splittedPath.slice(1, 4),
		`w_${width}`,
		splittedPath.slice(4),
	].join('/');
	url.pathname = newPath;
	// url.href replaces '/' with ','. I don't know why. So I explicitly replace ',' with '/'.
	return url.href.replace(/,/g, '/').replace(/\.[a-z]+$/, '.' + extension);
}

export function originalFileNameFromPublicId(publicId: string): string {
	return publicId.replace(/_[a-z0-9]{6}$/, '');
}

function isCloudinarySettings(obj: unknown): obj is CloudinarySettings {
	if (typeof obj !== 'object') return false;
	if (obj === null) return false;

	const { defaultWidth, defaultFormat, cloudName, apiKey, apiSecret } =
		obj as UnknownObject<CloudinarySettings>;
	const validDefaultWidth =
		typeof defaultWidth === 'number' && Number.isInteger(defaultWidth);
	if (!validDefaultWidth) return false;
	if (typeof defaultFormat !== 'string') return false;
	if (typeof cloudName !== 'string') return false;
	if (typeof apiKey !== 'string') return false;
	if (typeof apiSecret !== 'string') return false;
	return true;
}
