import { debounce, Notice, Setting } from 'obsidian';
import {
	MinimalPlugin,
	type MinimalPluginSettings,
	type UnknownObject,
} from '../Shared';

interface RandomGeneratorSettings extends MinimalPluginSettings {
	strLength: number;
	useLowercaseAlphabet: boolean;
	useUppercaseAlphabet: boolean;
	useNumber: boolean;
	prefix: string;
	suffix: string;
}

export const DEFAULT_SETTINGS: RandomGeneratorSettings = {
	strLength: 8,
	useLowercaseAlphabet: true,
	useUppercaseAlphabet: false,
	useNumber: true,
	prefix: '',
	suffix: '',
};

export class RandomGenerator extends MinimalPlugin {
	settings: RandomGeneratorSettings = DEFAULT_SETTINGS;

	override onload(): void {
		console.log('RandomGenerator loaded');

		this.settings = this.loadSettings(isRandomGeneratorSettings);

		this.addCommand({
			id: 'generate-random-string',
			name: 'Generate random string',
			callback: async () => {
				let chooseFrom = '';
				if (this.settings.useLowercaseAlphabet)
					chooseFrom += 'abcdefghijklmnopqrstuvwxyz';
				if (this.settings.useUppercaseAlphabet)
					chooseFrom += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				if (this.settings.useNumber) chooseFrom += '0123456789';

				const random = Array.from(
					crypto.getRandomValues(
						new Uint32Array(this.settings.strLength)
					)
				)
					.map((n) => chooseFrom[n % chooseFrom.length])
					.join('');
				const text =
					this.settings.prefix + random + this.settings.suffix;
				navigator.clipboard.writeText(text);
				new Notice(`Copy ${text}`);
			},
		});
	}

	displaySettings(containerEl: HTMLElement): void {
		const strLengthSaveDebouncer = debounce(
			(value: string) => {
				const strLength = Number.parseInt(value);
				if (!(Number.isInteger(strLength) && strLength > 0)) {
					new Notice('Invalid input');
					return;
				}
				this.settings.strLength = strLength;
				this.requestSaveSettings();
			},
			1000,
			true
		);
		new Setting(containerEl).setName('Length').addText((component) => {
			component
				.setValue(this.settings.strLength.toString())
				.onChange(strLengthSaveDebouncer);
		});
		new Setting(containerEl).setName('a - z').addToggle((component) => {
			component
				.setValue(this.settings.useLowercaseAlphabet)
				.onChange((value) => {
					this.settings.useLowercaseAlphabet = value;
					this.requestSaveSettings();
				});
		});
		new Setting(containerEl).setName('A - Z').addToggle((component) => {
			component
				.setValue(this.settings.useUppercaseAlphabet)
				.onChange((value) => {
					this.settings.useUppercaseAlphabet = value;
					this.requestSaveSettings();
				});
		});
		new Setting(containerEl).setName('0 - 9').addToggle((component) => {
			component.setValue(this.settings.useNumber).onChange((value) => {
				this.settings.useNumber = value;
				this.requestSaveSettings();
			});
		});
		const prefixSaveDebouncer = debounce(
			(value: string) => {
				this.settings.prefix = value;
				this.requestSaveSettings();
			},
			1000,
			true
		);
		new Setting(containerEl).setName('Prefix').addText((component) => {
			component
				.setValue(this.settings.prefix)
				.onChange(prefixSaveDebouncer);
		});
		const suffixSaveDebouncer = debounce(
			(value: string) => {
				this.settings.suffix = value;
				this.requestSaveSettings();
			},
			1000,
			true
		);
		new Setting(containerEl).setName('Suffix').addText((component) => {
			component
				.setValue(this.settings.suffix)
				.onChange(suffixSaveDebouncer);
		});
	}
}

function isRandomGeneratorSettings(
	obj: unknown
): obj is RandomGeneratorSettings {
	if (typeof obj !== 'object' || obj === null) return false;

	const { strLength, useLowercaseAlphabet, useUppercaseAlphabet, useNumber } =
		obj as UnknownObject<RandomGeneratorSettings>;
	if (typeof strLength !== 'number') return false;
	if (!Number.isInteger(strLength) && strLength > 0) return false;
	if (typeof useLowercaseAlphabet !== 'boolean') return false;
	if (typeof useUppercaseAlphabet !== 'boolean') return false;
	if (typeof useNumber !== 'boolean') return false;

	return true;
}
