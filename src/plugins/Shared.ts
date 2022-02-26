import { EVENT_SHOULD_SAVE } from 'Events';
import { App, Component, Events, Notice, type Command } from 'obsidian';

export abstract class MinimalPlugin extends Component {
	protected readonly app: App;
	private readonly data: MinimalPluginSettings | undefined;
	private readonly events: Events;
	private commands: Command[] = [];

	constructor(
		app: App,
		data: MinimalPluginSettings | undefined,
		events: Events
	) {
		super();
		this.app = app;
		this.data = data;
		this.events = events;
	}

	protected addCommand(cmd: Command) {
		this.commands.push(cmd);
	}

	public listCommands(): Command[] {
		return this.commands;
	}

	loadSettings<T>(cb: (obj: unknown) => obj is T): T {
		if (cb(this.data)) {
			return this.data;
		} else {
			const msg = '[ERROR in Toolbox]: failed to load settings';
			new Notice(msg);
			console.log(msg, 'minimal plugin:', this, 'data:', this.data);
			throw new Error(msg);
		}
	}

	requestSaveSettings() {
		this.events.trigger(EVENT_SHOULD_SAVE);
	}

	// use h4, h5, ... for headings
	abstract displaySettings(containerEl: HTMLElement): void;
}

export interface IMinimalPlugin {
	new (
		app: App,
		settings: Record<string, unknown> | undefined,
		events: Events
	): MinimalPlugin;
}

export type MinimalPluginSettings = Record<string, unknown>;

export type UnknownObject<T extends object> = {
	[P in keyof T]: unknown;
};
