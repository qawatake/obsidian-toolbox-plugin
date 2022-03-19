import { App, Modal, Notice } from 'obsidian';
import {
	formatCloudinaryUrl,
	originalFileNameFromPublicId,
	type Cloudinary,
} from './Cloudinary';
import type {
	CloudinaryResponseCallback,
	CloudinaryResponseErrorCallback,
} from './CloudinaryApi';

export class ModalPublicUrl extends Modal {
	private readonly plugin: Cloudinary;
	private inputEl: HTMLInputElement | undefined;

	constructor(app: App, plugin: Cloudinary) {
		super(app);
		this.plugin = plugin;
	}

	override onOpen(): void {
		this.inputEl = this.display();
		this.setHotkey(this.inputEl);
	}

	override onClose(): void {
		this.containerEl.empty();
	}

	private display(): HTMLInputElement {
		const { contentEl } = this;
		this.titleEl.textContent = 'Public URL';

		const inputEl = contentEl.createEl('input', {
			type: 'text',
			attr: {
				style: 'width: 100%',
			},
		});
		inputEl.focus();
		return inputEl;
	}

	private setHotkey(inputEl: HTMLInputElement) {
		this.scope.register([], 'Enter', (evt) => {
			(async () => {
				evt.preventDefault();
				const url = inputEl.value;
				await this.plugin.api?.upload(
					url,
					{},
					this.onCloudinaryResponseSuccess,
					this.onCloudinaryResponseError
				);
				this.close();
			})();
		});
	}

	private onCloudinaryResponseSuccess: CloudinaryResponseCallback = (
		result
	) => {
		const gotUrl = result.secure_url;
		const formattedUrl = formatCloudinaryUrl(
			gotUrl,
			this.plugin.settings.defaultWidth,
			this.plugin.settings.defaultFormat
		);
		const originalFileName = originalFileNameFromPublicId(result.public_id);
		navigator.clipboard.writeText(
			`![${originalFileName}](${formattedUrl})`
		);
		new Notice(`Copy link for ${originalFileName}!`);
	};

	private onCloudinaryResponseError: CloudinaryResponseErrorCallback = (
		err
	) => {
		new Notice('[ERROR in Toolbox] failed to upload. See console.');
		console.log('[ERROR in Toolbox] failed to upload.', err.error.message);
	};
}
