import { App, Modal, TFile, WorkspaceLeaf } from 'obsidian';

export class ExampleModal extends Modal {
	previewEl: HTMLElement;
	constructor(app: App) {
		super(app);
		this.previewEl = createDiv();
	}

	onOpen() {
		const { contentEl, containerEl } = this;
		// contentEl.setText("Look at me, I'm a modal! 👀");
		this.renderPreview();
		contentEl.appendChild(this.previewEl);
		console.log(contentEl.querySelector('div.workspace-leaf-content'));
		containerEl.id = 'qawatake';
		
		document.addEventListener('keydown', (ev) => {
			console.log(ev.key);
			if (ev.key === 'u') {
				console.log(this.containerEl);
				this.containerEl.createEl('div', {
					attr: {
						class: 'modal',
						style: 'margin-top:10px',
					},
					text: 'XXXXXXXXXXXx',
				});
			} else {
				console.log('error');
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	renderPreview() {
		this.previewEl.empty();
		this.createPane();
		// this.createPane();
		// this.createPane();
		// this.createPane();
	}

	createPane() {
		const containerEl = this.previewEl.createDiv({
			cls: 'first',
			attr: {
				style: 'height: 300px; width: 100%; display: inline-block',
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
		console.log(leaf);
	}
}
