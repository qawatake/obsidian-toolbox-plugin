import {
	TFile,
	moment,
	type App,
	type Editor,
	type MarkdownView,
	Events,
	Setting,
	Notice,
} from 'obsidian';
import {
	MinimalPlugin,
	type MinimalPluginSettings,
	type UnknownObject,
} from 'plugins/Shared';

const DEFAULT_TEMPLATE = '{{content}}';
const CONTENT_SYNTAX = /{{content}}/g;
const REGEXP_H1 = /# +([^\s]+)\s*/;

interface NoteRefactorSettings extends Record<string, unknown> {
	templatePath: string;
	newFileFolderPath: string;
	fileNameFormat: string;
}

export const DEFAULT_SETTINGS: NoteRefactorSettings = {
	templatePath: '',
	newFileFolderPath: '/',
	fileNameFormat: 'YYMMDD-HHmmss',
};

export class NoteRefactor extends MinimalPlugin implements MinimalPlugin {
	settings: NoteRefactorSettings;
	constructor(
		app: App,
		data: MinimalPluginSettings | undefined,
		events: Events
	) {
		super(app, data, events);
		if (!isNoteRefactorSettings(data)) {
			new Notice(
				`[ERROR in Toolbox] failed to load settings in NoteRefactor`
			);
			throw new Error(
				`[ERROR in Toolbox] failed to load settings: ${data}`
			);
		}
		this.settings = data;
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

	displaySettings(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName('Template file location')
			.addText((component) => {
				component
					.setValue(this.settings.templatePath)
					.onChange((path) => {
						this.settings.templatePath = path;
						this.requestSaveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Default location for new notes')
			.addText((component) => {
				component
					.setValue(this.settings.newFileFolderPath)
					.onChange((path) => {
						this.settings.newFileFolderPath = path;
						this.requestSaveSettings();
					});
			});

		new Setting(containerEl)
			.setName('File name format')
			.addText((component) => {
				component
					.setValue(this.settings.fileNameFormat)
					.onChange((path) => {
						this.settings.fileNameFormat = path;
						this.requestSaveSettings();
					});
			});
	}

	private async extract(editor: Editor) {
		const template = await this.readTemplate(this.settings.templatePath);
		if (template === undefined) {
			throw new Error(
				`Toolbox: failed to read template: ${this.settings.templatePath}`
			);
		}
		const extracted = editor.getSelection();
		const content = this.generateContent(template, extracted);

		const newFile = await this.app.vault.create(this.newFilePath, content);
		editor.replaceSelection(this.generateWikiLink(newFile, content));
	}

	private async readTemplate(path: string): Promise<string> {
		if (path === '') return DEFAULT_TEMPLATE;
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) {
			new Notice(
				`[ERROR in Toolbox] failed to read template from path: ${path}`
			);
			throw new Error(
				`[ERROR in Toolbox] failed to read template from path: ${path}`
			);
		}
		return await this.app.vault.read(file);
	}

	private generateContent(template: string, extracted: string): string {
		return template.replace(CONTENT_SYNTAX, extracted);
	}

	private get newFilePath(): string {
		return `${this.newFileFolderPath}/${(moment as any)(
			moment.now()
		).format(this.settings.fileNameFormat)}.md`;
	}

	private get newFileFolderPath(): string {
		if (this.settings.newFileFolderPath !== '')
			return this.settings.newFileFolderPath;
		const path = this.app.vault.config.newFileFolderPath;
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

function isNoteRefactorSettings(obj: unknown): obj is NoteRefactorSettings {
	if (typeof obj !== 'object') return false;

	const { templatePath, fileNameFormat } =
		obj as UnknownObject<NoteRefactorSettings>;
	if (typeof templatePath !== 'string') return false;
	if (typeof fileNameFormat !== 'string') return false;
	return true;
}
