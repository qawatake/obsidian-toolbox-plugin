import { CopyWikiLink } from './CopyWikiLink/CopyWikiLink';
import { NoteRefactor } from './NoteRefactor/NoteRefactor';
import type { MinimalPlugin } from './Shared';

export type MinimalPluginsGeneratorMap = {
	[id in string]: MinimalPluginInfo;
};

export interface MinimalPluginInfo {
	description: string;
	generator: typeof MinimalPlugin;
}

export const MINIMAL_PLUGIN_LIST: MinimalPluginsGeneratorMap = {
	'copy-wiki-link': {
		description: 'Copy wiki link',
		generator: CopyWikiLink,
	},
	'note-refactor': {
		description: 'Extract current selection',
		generator: NoteRefactor,
	},
};
