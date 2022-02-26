import { Events, Notice, type App } from 'obsidian';
import { MinimalPlugin } from 'plugins/Shared';
import { generateInternalLinkFrom } from 'plugins/CopyWikiLink/Link';

export class CopyWikiLink extends MinimalPlugin implements MinimalPlugin {
	constructor(
		app: App,
		data: Record<string, unknown> | undefined,
		events: Events
	) {
		super(app, data, events);
	}

	override onload(): void {
		console.log('CopyWikiLink load');

		this.addCommand({
			id: 'copy-wiki-link',
			name: 'Copy wiki link',
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveFile();
				if (file === null) return false;
				if (checking) return true;

				const link = generateInternalLinkFrom(
					this.app.metadataCache,
					file
				);
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
		console.log('x');
		containerEl.createEl('div', { text: 'Copy wiki link' });
	}
}
