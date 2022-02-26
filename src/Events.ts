import { type EventRef, Events } from 'obsidian';

export const EVENT_SHOULD_SAVE = 'should-save';

export class ToolboxEvents extends Events {
	override trigger(name: typeof EVENT_SHOULD_SAVE): void;
	override trigger(name: string, ...data: any[]): void {
		super.trigger(name, ...data);
	}

	override on(
		name: typeof EVENT_SHOULD_SAVE,
		callback: () => any,
		ctx?: any
	): EventRef;

	override on(
		name: string,
		callback: (...data: any[]) => any,
		ctx?: any
	): EventRef {
		return super.on(name, callback, ctx);
	}
}
