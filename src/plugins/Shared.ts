import { EVENT_SHOULD_SAVE } from 'Events';
import { App, Component, Events, type Command } from 'obsidian';

export class MinimalPlugin extends Component {
	protected readonly app: App;
	private readonly settings: Record<string, unknown>;
	private readonly events: Events;
	private commands: Command[] = [];

	constructor(app: App, settings: Record<string, unknown>, events: Events) {
		super();
		this.app = app;
		this.settings = settings;
		this.events = events;
	}

	protected addCommand(cmd: Command) {
		this.commands.push(cmd);
	}

	public listCommands(): Command[] {
		return this.commands;
	}

	loadSettings(): Record<string, unknown> {
		return this.settings;
	}

	requestSaveSettings() {
		this.events.trigger(EVENT_SHOULD_SAVE);
	}
}
