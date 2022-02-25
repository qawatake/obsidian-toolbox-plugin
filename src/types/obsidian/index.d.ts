export * from 'obsidian';

declare module 'obsidian' {
	interface App {
		commands: CommandManager;
	}

	interface CommandManager {
		removeCommand(id: string);
	}
}
