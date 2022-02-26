export * from 'obsidian';

declare module 'obsidian' {
	interface App {
		commands: CommandManager;
		vault: Vault;
	}

	interface CommandManager {
		removeCommand(id: string);
	}

	interface Vault {
		config: BuiltInConfig;
	}

	interface BuiltInConfig {
		newFileFolderPath: string | undefined;
	}
}
