import { CopyWikiLink } from './CopyWikiLink/CopyWikiLink';
import { NoteRefactor } from './NoteRefactor/NoteRefactor';
import type { MinimalPlugin } from './Shared';

export type MinimalPluginsGeneratorMap = {
	[id in string]: MinimalPluginInfo;
};

export interface MinimalPluginInfo {
	description: string;
	generator: typeof MinimalPlugin;
	defaultData: Record<string, unknown>;
}

export const MINIMAL_PLUGIN_LIST: MinimalPluginsGeneratorMap = {
	'copy-wiki-link': {
		description: 'Copy wiki link',
		generator: CopyWikiLink,
		defaultData: {},
	},
	'note-refactor': {
		description: 'Extract current selection',
		generator: NoteRefactor,
		defaultData: {},
	},
};
