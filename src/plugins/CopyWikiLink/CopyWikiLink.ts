import { Notice, type App } from 'obsidian';
import { MinimalPlugin } from 'plugins/Shared';
import { generateInternalLinkFrom } from './Link';

export class CopyWikiLink extends MinimalPlugin {
	constructor(app: App) {
		super(app);
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
}
