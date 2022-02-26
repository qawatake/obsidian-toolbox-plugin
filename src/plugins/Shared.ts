import { EVENT_SHOULD_SAVE } from 'Events';
import { App, Component, Events, type Command } from 'obsidian';

export abstract class MinimalPlugin extends Component {
	protected readonly app: App;
	private readonly settings: Record<string, unknown> | undefined;
	private readonly events: Events;
	private commands: Command[] = [];

	constructor(
		app: App,
		settings: Record<string, unknown> | undefined,
		events: Events
	) {
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

	loadSettings(): Record<string, unknown> | undefined {
		return this.settings;
	}

	requestSaveSettings() {
		this.events.trigger(EVENT_SHOULD_SAVE);
	}

	abstract displaySettings(containerEl: HTMLElement): void;
}

export interface IMinimalPlugin {
	new (
		app: App,
		settings: Record<string, unknown> | undefined,
		events: Events
	): MinimalPlugin;
}
