import { MinimalPlugin } from 'plugins/Shared';

export class CopyWikiLink extends MinimalPlugin {
	constructor() {
		super();
	}

	override onload(): void {
		console.log('CopyWikiLink load');
	}

	override onunload(): void {
		console.log('CopyWikiLink unload');
	}
}
