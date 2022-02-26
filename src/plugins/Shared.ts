import { EVENT_SHOULD_SAVE } from 'Events';
import { App, Component, Events, type Command } from 'obsidian';

export abstract class MinimalPlugin extends Component {
	protected readonly app: App;
	private readonly events: Events;
	private commands: Command[] = [];

	constructor(
		app: App,
		_settings: MinimalPluginSettings | undefined,
		events: Events
	) {
		super();
		this.app = app;
		this.events = events;
	}

	protected addCommand(cmd: Command) {
		this.commands.push(cmd);
	}

	public listCommands(): Command[] {
		return this.commands;
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
