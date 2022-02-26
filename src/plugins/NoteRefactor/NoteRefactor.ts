import {
	TFile,
	moment,
	type App,
	type Editor,
	type MarkdownView,
} from 'obsidian';
import { MinimalPlugin } from 'plugins/Shared';

const TEMPLATE_FILE_PATH = '_templater/templates/note-composer.md';
const CONTENT_SYNTAX = /{{content}}/g;
const MOMENT_FORMAT = 'YYMMDD-HHmmss';
const REGEXP_H1 = /# +([^\s]+)\r?\n/;

export class NoteRefactor extends MinimalPlugin {
	constructor(app: App) {
		super(app);
	}

	override onload(): void {
		console.log('NoteRefactor load');
		this.addCommand({
			id: 'split-file',
			name: 'Extract current selection',
			editorCheckCallback: (
				checking: boolean,
				editor: Editor,
				_view: MarkdownView
			) => {
				if (editor.getSelection().length === 0) return false;
				if (checking) return true;
				this.extract(editor);
				return true;
			},
		});
	}

	override onunload(): void {
		console.log('NoteRefactor unload');
	}
	private async extract(editor: Editor) {
		const template = await this.readTemplate(TEMPLATE_FILE_PATH);
		if (template === undefined) {
			throw new Error(
				`Toolbox: failed to read template: ${TEMPLATE_FILE_PATH}`
			);
		}
		const extracted = editor.getSelection();
		const content = this.generateContent(template, extracted);

		const newFile = await this.app.vault.create(this.newFilePath, content);
		editor.replaceSelection(this.generateWikiLink(newFile, content));
	}

	private async readTemplate(path: string): Promise<string | undefined> {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) return;
		return await this.app.vault.read(file);
	}

	private generateContent(template: string, extracted: string): string {
		return template.replace(CONTENT_SYNTAX, extracted);
	}

	private get newFilePath(): string {
		return `${this.newFileFolderPath}/${(moment as any)(
			moment.now()
		).format(MOMENT_FORMAT)}.md`;
	}

	private get newFileFolderPath(): string {
		const path = this.app.vault.config.newFileFolderPath;
		console.log(this.app.vault.config);
		return path === undefined ? '' : path;
	}

	// we cannot use metadataCache.getFileCache because cache for a new file has not been created yet.
	private generateWikiLink(file: TFile, content: string): string {
		const h1 = this.getH1(content);
		return this.app.fileManager.generateMarkdownLink(
			file,
			'',
			undefined,
			h1
		);
	}

	private getH1(content: string): string | undefined {
		const found = content.match(REGEXP_H1);
		if (found === null) return undefined;
		const h1 = found[1];
		return h1;
	}
}
