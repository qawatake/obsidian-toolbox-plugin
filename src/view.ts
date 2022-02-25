import { ItemView, MarkdownView, TFile, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_EXAMPLE = 'example-view';

export class ExampleView extends ItemView {
	previewEl: HTMLElement;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.previewEl = createDiv();
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return 'Example view';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		// container.createEl('h4', { text: 'Example view' });
		this.renderPreview();
		const div = container?.createEl('div');
		div?.appendChild(this.previewEl);
		// container.appendChild(this.previewEl);
	}

	async onClose() {
		// Nothing to clean up.
	}

	renderPreview() {
		this.previewEl.empty();
		this.createPane();
		this.createPane();
		this.createPane();
		this.createPane();
	}

	createPane() {
		const containerEl = this.previewEl.createDiv({
			cls: 'first',
			attr: {
				style: 'height: 200px; width: 400px; display: inline-block',
			},
		});
		const leaf = new WorkspaceLeaf(this.app);
		// const mdView = new MarkdownView(leaf);
		const firstFile = this.app.vault.getAbstractFileByPath(
			'subfolder3/INFO_2021_cow_JPG.md'
		) as TFile; // don't do this, I'm just being lazy getting a TFile
		containerEl.appendChild(leaf.containerEl);
		// const state = leaf.getViewState();
		leaf.openFile(firstFile, { state: { mode: 'preview' } });
		// console.log(leaf.getViewState());
	}
}
