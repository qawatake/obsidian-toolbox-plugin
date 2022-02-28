import { App, Modal } from 'obsidian';
import type { Cloudinary } from './Cloudinary';

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
		this.scope.register([], 'Enter', () => {
			const url = inputEl.value;
			this.plugin.api.upload(
				url,
				this.plugin.onCloudinaryUploadResponse(
					this.fileNameFromUrl(url)
				)
			);
			this.close();
		});
	}

	private fileNameFromUrl(publicUrl: string): string {
		const url = new URL(publicUrl);
		return url.pathname.split('/').last() ?? '';
	}
}
