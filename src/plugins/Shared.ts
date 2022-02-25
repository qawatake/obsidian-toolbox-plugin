import { App, Component, type Command } from 'obsidian';

export class MinimalPlugin extends Component {
	protected readonly app: App;
	private commands: Command[] = [];

	constructor(app: App) {
		super();
		this.app = app;
	}

	protected addCommand(cmd: Command) {
		this.commands.push(cmd);
	}

	public listCommands(): Command[] {
		return this.commands;
	}
}
