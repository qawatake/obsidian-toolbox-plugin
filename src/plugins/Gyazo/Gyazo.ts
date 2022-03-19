import { Notice, Setting } from 'obsidian';
import {
	MinimalPlugin,
	type MinimalPluginSettings,
	type UnknownObject,
} from 'plugins/Shared';
import {
	GyazoDirectApi,
	type GyazoApi,
	type GyazoResponseCallback,
	type GyazoResponseErrorCallback,
} from './GyazoApi';

interface GyazoSettings extends MinimalPluginSettings {
	accessToken: string;
}

export const DEFAULT_SETTINGS: GyazoSettings = {
	accessToken: '',
};

export class Gyazo extends MinimalPlugin {
	settings: GyazoSettings = DEFAULT_SETTINGS;
	private api: GyazoApi | undefined;

	override onload(): void {
		console.log('Gyazo loaded');

		this.settings = this.loadSettings(isGyazoSettings);

		this.api = this.setApi();

		this.addCommand({
			id: 'gyazo-upload',
			name: 'Upload to Gyazo',
			callback: () => {
				this.showImportDialog();
			},
		});
	}

	displaySettings(containerEl: HTMLElement): void {
		let inputEl: HTMLInputElement;
		let accessToken: string;
		new Setting(containerEl)
			.setName('Access Token')
			.addText((component) => {
				component.onChange((value) => {
					accessToken = value;
				});
				inputEl = component.inputEl;
			})
			.addButton((component) => {
				component.setButtonText('Save').onClick(() => {
					this.settings.accessToken = accessToken;
					inputEl.value = '';
					this.api = this.setApi();
					this.requestSaveSettings();
				});
			});
	}

	private setApi(): GyazoApi {
		const { accessToken } = this.settings;
		return new GyazoDirectApi({
			accessToken,
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

		const linksToCopy: string[] = [];
		const promises: Promise<void>[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file === undefined) {
				continue;
			}
			const { api } = this;
			if (!api) return;

			if (!file.type.startsWith('image/')) {
				new Notice(
					`[ERROR in Toolbox]: ${file.name} is not an image file.`
				);
				return;
			}

			promises.push(
				api.upload(
					file,
					{
						app: 'Obsidian',
					},
					this.onGyazoResponseSuccess(linksToCopy),
					this.onGyazoResponseError
				)
			);
			new Notice(`${file.name} uploaded!`);
		}

		await Promise.all(promises);
		await navigator.clipboard.writeText(linksToCopy.join('\n'));
		if (linksToCopy.length === 1) {
			new Notice('Copy link!');
		} else {
			new Notice('Copy links!');
		}
	}

	private onGyazoResponseSuccess(
		linksToCopy: string[]
	): GyazoResponseCallback {
		return (result) => {
			const gyazoUrl = result.permalink_url;
			const imageUrl = result.url;
			const embedText = `[![](${imageUrl})](${gyazoUrl})`;
			linksToCopy.push(embedText);
		};
	}

	onGyazoResponseError: GyazoResponseErrorCallback = (err) => {
		new Notice('[ERROR in Toolbox] failed to upload. See console.');
		console.log('[ERROR in Toolbox] failed to upload.', err.message);
	};
}

function isGyazoSettings(obj: unknown): obj is GyazoSettings {
	if (typeof obj !== 'object' || obj === null) return false;
	const { accessToken } = obj as UnknownObject<GyazoSettings>;
	if (typeof accessToken !== 'string') return false;
	return true;
}
