import { MinimalPlugin } from 'plugins/Shared';
import { generateInternalLinkFrom } from 'plugins/CopyWikiLink/Link';
import { Notice } from 'obsidian';

export class CopyWikiLink extends MinimalPlugin implements MinimalPlugin {
	override onload(): void {
		console.log('CopyWikiLink load');

		this.addCommand({
			id: 'copy-wiki-link',
			name: 'Copy wiki link',
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveFile();
				if (file === null) return false;
				if (checking) return true;

				const link = generateInternalLinkFrom(this.app, file);
				new Notice(`Copy wiki link of ${file.name}`);
				navigator.clipboard.writeText(link);
				return true;
			},
		});
	}

	override onunload(): void {
		console.log('CopyWikiLink unload');
	}

	displaySettings(containerEl: HTMLElement): void {
		containerEl.createEl('div', { text: 'Copy wiki link' });
	}
}
