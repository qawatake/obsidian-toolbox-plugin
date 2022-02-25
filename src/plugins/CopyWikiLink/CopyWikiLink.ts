import { Notice, type App } from 'obsidian';
import { MinimalPlugin } from 'plugins/Shared';

export class CopyWikiLink extends MinimalPlugin {
	constructor(app: App) {
		super(app);
	}

	override onload(): void {
		console.log('CopyWikiLink load');

		this.addCommand({
			id: 'copy-wiki-link',
			name: 'Copy wiki link',
			callback: () => {
				new Notice('Copy Wiki Link!');
			},
		});
	}

	override onunload(): void {
		console.log('CopyWikiLink unload');
	}
}
