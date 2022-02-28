import * as CopyWikiLink from './CopyWikiLink/CopyWikiLink';
import * as NoteRefactor from './NoteRefactor/NoteRefactor';
import * as Cloudinary from './Cloudinary/Cloudinary';
import type { IMinimalPlugin, MinimalPluginSettings } from './Shared';

export type MinimalPluginsGeneratorMap = {
	[id in string]: MinimalPluginInfo;
};

export interface MinimalPluginInfo {
	name: string;
	description: string;
	generator: IMinimalPlugin;
	defaultData: MinimalPluginSettings | undefined;
}

export const MINIMAL_PLUGIN_LIST: MinimalPluginsGeneratorMap = {
	'copy-wiki-link': {
		name: 'Wiki link getter',
		description: 'Copy wiki link',
		generator: CopyWikiLink.CopyWikiLink,
		defaultData: undefined,
	},
	'note-refactor': {
		name: 'Note refactor',
		description: 'Replace current selection with wiki link',
		generator: NoteRefactor.NoteRefactor,
		defaultData: NoteRefactor.DEFAULT_SETTINGS,
	},
	cloudinary: {
		name: 'Cloudinary',
		description:
			'Uploads images to Cloudinary instead of storing them locally in your vault',
		generator: Cloudinary.Cloudinary,
		defaultData: Cloudinary.DEFAULT_SETTINGS,
	},
};
