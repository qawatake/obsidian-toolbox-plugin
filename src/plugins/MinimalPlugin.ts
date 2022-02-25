import { CopyWikiLink } from './CopyWikiLink/CopyWikiLink';
import type { MinimalPlugin } from './Shared';

export type MinimalPluginsGeneratorMap = {
	[id in string]: typeof MinimalPlugin;
};

export const MINIMAL_PLUGIN_GENERATORS: MinimalPluginsGeneratorMap = {
	'copy-wiki-link': CopyWikiLink,
};
