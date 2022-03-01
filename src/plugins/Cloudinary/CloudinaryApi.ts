import { moment, Notice } from 'obsidian';
import type { UnknownObject } from 'plugins/Shared';

interface CloudinaryApiConfig {
	cloudName: string;
	apiKey: string;
	apiSecret: string;
}

interface CloudinaryAuthSignature {
	timestamp: number;
	signature: string;
}

export interface CloudinaryApi {
	upload(
		publicUrl: string,
		onSuccess: CloudinaryResponseCallback,
		onError: CloudinaryResponseErrorCallback
	): void | Promise<void>;
	upload(
		file: File,
		onSuccess: CloudinaryResponseCallback,
		onError: CloudinaryResponseErrorCallback
	): void | Promise<void>;
}

export type CloudinaryResponseCallback = (
	result: CloudinaryResponseResult
) => void | Promise<void>;

export type CloudinaryResponseErrorCallback = (
	err: CloudinaryResponseError
) => void | Promise<void>;

interface CloudinaryResponseError {
	error: {
		message: string;
	};
}

interface CloudinaryResponseResult {
	original_filename: string;
	public_id: string;
	secure_url: string;
}

export class CloudinaryDirectApi implements CloudinaryApi {
	private readonly cloudName: string;
	private readonly apiKey: string;
	private readonly apiSecret: string;

	constructor(configOption: CloudinaryApiConfig) {
		const { cloudName, apiKey, apiSecret } = configOption;
		this.cloudName = cloudName;
		this.apiKey = apiKey;
		this.apiSecret = apiSecret;
	}

	/**
	 *
	 * @param fileData public URL or file object
	 * @param success callback
	 * @param error callback
	 */
	async upload(
		fileData: string | File,
		success: CloudinaryResponseCallback,
		error: CloudinaryResponseErrorCallback
	) {
		const formData = await this.generateFormData(fileData);
		try {
			const res = await fetch(this.cloudinaryUploadUrl, {
				method: 'POST',
				body: formData,
			});
			const body = await res.json();
			if (res.status === 200) {
				if (isCloudinaryResponseResult(body)) {
					success(body);
				}
			} else if (isCloudinaryResponseError(body)) {
				error(body);
			} else {
				new Notice('[ERROR in Toolbox] failed to upload. See console.');
				console.log('[ERROR in Toolbox]: unexpected error.', res.body);
			}
		} catch (err) {
			new Notice('[ERROR in Toolbox] failed to upload. See console.');
			console.log('[ERROR in Toolbox]: unexpected error.', err);
		}
	}

	/**
	 *
	 * @param fileData public URL or file object
	 * @returns Promise of URL returned by Cloudinary
	 */
	// async upload(fileData: File | string): Promise<string | undefined> {
	// 	const formData = await this.generateFormData(fileData);
	// 	try {
	// 		const res = await fetch(this.cloudinaryUploadUrl, {
	// 			method: 'POST',
	// 			body: formData,
	// 		});
	// 		const body = await res.json();
	// 		if (res.status === 200) {
	// 			if (isCloudinaryResponseResult(body)) {
	// 				console.log(body.secure_url);
	// 			}
	// 		} else if (isCloudinaryResponseError(body)) {
	// 			console.log(body.error.message);
	// 		} else {
	// 			console.log('unexpected error:', res.body);
	// 		}
	// 		return body.secure_url;
	// 	} catch (err) {
	// 		new Notice('[ERROR in Toolbox] failed to upload. See console.');
	// 		console.log(err);
	// 		return undefined;
	// 	}
	// }

	/**
	 * @param fileData public URL or file object
	 */
	private async generateFormData(fileData: File | string): Promise<FormData> {
		const formData = new FormData();
		formData.append('file', fileData);
		formData.append('api_key', this.apiKey);
		const authSignature = await this.generateAuthSignature();
		formData.append('timestamp', authSignature.timestamp.toString());
		formData.append('signature', authSignature.signature);
		return formData;
	}

	private get cloudinaryUploadUrl(): string {
		return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
	}

	private async generateAuthSignature(): Promise<CloudinaryAuthSignature> {
		const timestamp = moment.now();
		const sha1Input = `timestamp=${timestamp}${this.apiSecret}`;

		// https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
		// https://developer.mozilla.org/ja/docs/Web/API/SubtleCrypto/digest#%E3%83%80%E3%82%A4%E3%82%B8%E3%82%A7%E3%82%B9%E3%83%88%E5%80%A4%E3%82%9216%E9%80%B2%E6%96%87%E5%AD%97%E5%88%97%E3%81%AB%E5%A4%89%E6%8F%9B%E3%81%99%E3%82%8B
		const hashBuffer = await crypto.subtle.digest(
			'SHA-1',
			new TextEncoder().encode(sha1Input)
		);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
		console.log(hashHex);
		return {
			timestamp,
			signature: hashHex,
		};
	}
}

function isCloudinaryResponseError(
	obj: unknown
): obj is CloudinaryResponseError {
	if (typeof obj !== 'object' || obj === null) return false;

	const { error } = obj as UnknownObject<CloudinaryResponseError>;
	if (typeof error !== 'object' || error === null) return false;

	const { message } = error as UnknownObject<{ message: string }>;
	if (typeof message !== 'string') return false;

	return true;
}

function isCloudinaryResponseResult(
	obj: unknown
): obj is CloudinaryResponseResult {
	if (typeof obj !== 'object' || obj === null) return false;

	const { secure_url, public_id, original_filename } =
		obj as UnknownObject<CloudinaryResponseResult>;
	if (typeof secure_url !== 'string') return false;
	if (typeof public_id !== 'string') return false;
	if (typeof original_filename !== 'string') return false;
	return true;
}
