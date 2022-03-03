import * as CopyWikiLink from './CopyWikiLink/CopyWikiLink';
import * as NoteRefactor from './NoteRefactor/NoteRefactor';
import * as Cloudinary from './Cloudinary/Cloudinary';
import * as Gyazo from './Gyazo/Gyazo';
import * as RandomGenerator from './RandomGenerator/RandomGenerator';
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
			'Upload images to Cloudinary instead of storing them locally in your vault',
		generator: Cloudinary.Cloudinary,
		defaultData: Cloudinary.DEFAULT_SETTINGS,
	},
	gyazo: {
		name: 'Gyazo',
		description:
			'Upload images to Cloudinary instead of storing then locally in your vault',
		generator: Gyazo.Gyazo,
		defaultData: Gyazo.DEFAULT_SETTINGS,
	},
	random: {
		name: 'Random Generator',
		description: 'Generate random strings',
		generator: RandomGenerator.RandomGenerator,
		defaultData: RandomGenerator.DEFAULT_SETTINGS,
	},
};
