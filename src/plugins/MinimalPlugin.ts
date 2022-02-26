import { CopyWikiLink } from './CopyWikiLink/CopyWikiLink';
import { NoteRefactor } from './NoteRefactor/NoteRefactor';
import type { IMinimalPlugin } from './Shared';

export type MinimalPluginsGeneratorMap = {
	[id in string]: MinimalPluginInfo;
};

export interface MinimalPluginInfo {
	name: string;
	description: string;
	generator: IMinimalPlugin;
	defaultData: Record<string, unknown> | undefined;
}

export const MINIMAL_PLUGIN_LIST: MinimalPluginsGeneratorMap = {
	'copy-wiki-link': {
		name: 'Wiki link getter',
		description: 'Copy wiki link',
		generator: CopyWikiLink,
		defaultData: undefined,
	},
	'note-refactor': {
		name: 'Note refactor',
		description: 'Extract current selection',
		generator: NoteRefactor,
		defaultData: undefined,
	},
};
