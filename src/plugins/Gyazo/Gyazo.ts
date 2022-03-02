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
				this.showImportDialog(this.handleImportedFile);
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

	private showImportDialog(cb: HandleImportedFile) {
		const inputEl = createEl('input', { type: 'file' });

		inputEl.multiple = true;
		inputEl.addEventListener('change', async () => {
			const files = inputEl.files;
			this.handleImportedFiles(files, cb);

			inputEl.remove();
		});
		inputEl.click();
	}

	private handleImportedFiles(
		files: FileList | null,
		cb: HandleImportedFile
	) {
		if (files === null || files.length === 0) {
			return;
		}

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file === undefined) {
				continue;
			}
			cb(file);
		}
	}

	private handleImportedFile = (file: File) => {
		if (!file.type.startsWith('image/')) {
			new Notice(
				`[ERROR in Toolbox]: ${file.name} is not an image file.`
			);
			return;
		}

		this.api?.upload(
			file,
			{
				app: 'Obsidian',
			},
			this.onGyazoResponseSuccess,
			this.onGyazoResponseError
		);
		new Notice(`Copy link for uploaded: ${file.name}!`);
	};

	onGyazoResponseSuccess: GyazoResponseCallback = (result) => {
		const gyazoUrl = result.permalink_url;
		const imageUrl = result.url;
		const embedText = `[![](${imageUrl})](${gyazoUrl})`;
		navigator.clipboard.writeText(embedText);
	};

	onGyazoResponseError: GyazoResponseErrorCallback = (err) => {
		new Notice('[ERROR in Toolbox] failed to upload. See console.');
		console.log('[ERROR in Toolbox] failed to upload.', err.message);
	};
}

type HandleImportedFile = (file: File) => void | Promise<void>;

function isGyazoSettings(obj: unknown): obj is GyazoSettings {
	if (typeof obj !== 'object' || obj === null) return false;
	const { accessToken } = obj as UnknownObject<GyazoSettings>;
	if (typeof accessToken !== 'string') return false;
	return true;
}
