import {
	v2 as cloudinary,
	type AdminApiOptions,
	type ConfigOptions,
	type ResponseCallback,
	type UploadApiOptions,
	type UploadApiResponse,
	type UploadResponseCallback,
} from 'cloudinary';

export interface CloudinaryApi {
	config(new_config?: boolean | ConfigOptions): ConfigOptions;
	upload(
		file: string,
		callback?: UploadResponseCallback
	): Promise<UploadApiResponse>;
	upload(
		absoluteFilePath: string,
		options?: UploadApiOptions,
		cb?: UploadResponseCallback
	): Promise<UploadApiResponse>;
	ping(options?: AdminApiOptions, callback?: ResponseCallback): Promise<any>;
}

export const cloudinaryApi: CloudinaryApi = {
	config: cloudinary.config,
	upload: cloudinary.uploader.upload,
	ping: cloudinary.api.ping,
};
