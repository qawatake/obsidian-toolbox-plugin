import { moment, Notice } from 'obsidian';

interface CloudinaryApiConfig {
	cloudName: string;
	apiKey: string;
	apiSecret: string;
}

interface CloudinaryAuthSignature {
	timestamp: number;
	signature: string;
}

export class CloudinaryApi {
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
	 * @returns Promise of URL returned by Cloudinary
	 */
	async upload(fileData: File | string): Promise<string | undefined> {
		const formData = await this.generateFormData(fileData);
		try {
			const res = await fetch(this.cloudinaryUploadUrl, {
				method: 'POST',
				body: formData,
			});
			const body = await res.json();
			return body.secure_url;
		} catch (err) {
			new Notice('[ERROR in Toolbox] failed to upload. See console.');
			console.log(err);
			return undefined;
		}
	}

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
