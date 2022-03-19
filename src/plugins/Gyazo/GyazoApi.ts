import { Notice } from 'obsidian';
import type { UnknownObject } from 'plugins/Shared';

export interface GyazoApi {
	/**
	 *
	 * @param file
	 * @param options options other than authentication info
	 * @param onSuccess callback executed on success
	 * @param onError callback executed on error
	 */
	upload(
		file: File,
		options: Record<string, string>,
		onSuccess: GyazoResponseCallback,
		onError: GyazoResponseErrorCallback
	): Promise<void>;
}

export interface GyazoApiAuth {
	accessToken: string;
}

export class GyazoDirectApi implements GyazoApi {
	private readonly auth: GyazoApiAuth;
	constructor(auth: GyazoApiAuth) {
		this.auth = auth;
	}

	async upload(
		file: File,
		options: Record<string, string>,
		onSuccess: GyazoResponseCallback,
		onError: GyazoResponseErrorCallback
	): Promise<void> {
		const formData = this.generateFormData(file, {
			access_token: this.auth.accessToken,
			...options,
		});

		try {
			const res = await fetch(this.uploadUrl, {
				method: 'POST',
				body: formData,
			});
			const body = await res.json();
			if (res.status === 200 && isGyazoResponseResult(body)) {
				await onSuccess(body);
			} else if (isGyazoResponseError(body)) {
				await onError(body);
			} else {
				new Notice('[ERROR in Toolbox] Unexpected error. See console.');
				console.log('uncaught err:', body);
			}
		} catch (err) {
			new Notice('[ERROR in Toolbox] Unexpected error. See console.');
			console.log('caught err:', err);
		}
	}

	/**
	 *
	 * @param file
	 * @param options options other than imagedata
	 * @returns FormData to be passed to fetch body
	 */
	private generateFormData(
		file: File,
		options: Record<string, string>
	): FormData {
		const formData = new FormData();
		formData.append('imagedata', file);
		Object.entries(options).forEach(([key, value]) => {
			formData.append(key, value);
		});
		return formData;
	}

	private get uploadUrl(): string {
		return 'https://upload.gyazo.com/api/upload';
	}
}

export type GyazoResponseCallback = (
	result: GyazoResponseResult
) => void | Promise<void>;
export type GyazoResponseErrorCallback = (
	err: GyazoResponseError
) => void | Promise<void>;

interface GyazoResponseResult {
	image_id: string; //  "8980c52421e452ac3355ca3e5cfe7a0c"
	permalink_url: string; // "http://gyazo.com/8980c52421e452ac3355ca3e5cfe7a0c"
	thumb_url: string; // "https://i.gyazo.com/thumb/180/afaiefnaf.png"
	url: string; // "https://i.gyazo.com/8980c52421e452ac3355ca3e5cfe7a0c.png"
	type: string; // "png"
}

interface GyazoResponseError {
	message: string; // "This method requires authentication"
	request: string; // "/api/images"
	method: string; // "GET"
}

function isGyazoResponseResult(obj: unknown): obj is GyazoResponseResult {
	if (typeof obj !== 'object' || obj === null) return false;

	const { image_id, permalink_url, thumb_url, url, type } =
		obj as UnknownObject<GyazoResponseResult>;
	if (typeof image_id !== 'string') return false;
	if (typeof permalink_url !== 'string') return false;
	if (typeof thumb_url !== 'string') return false;
	if (typeof url !== 'string') return false;
	if (typeof type !== 'string') return false;
	return true;
}

function isGyazoResponseError(obj: unknown): obj is GyazoResponseError {
	if (typeof obj !== 'object' || obj === null) return false;

	const { message, request, method } =
		obj as UnknownObject<GyazoResponseError>;
	if (typeof message !== 'string') return false;
	if (typeof request !== 'string') return false;
	if (typeof method !== 'string') return false;
	return true;
}
