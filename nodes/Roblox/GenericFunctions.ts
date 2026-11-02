import { randomBytes } from 'crypto';
import { blake2b } from 'blakejs';
import nacl from 'tweetnacl';
import type { IDataObject, IExecuteSingleFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

type MultipartPart =
	| { name: string; value: string }
	| { name: string; data: Buffer; fileName: string; contentType: string };

export function buildMultipartBody(parts: MultipartPart[]): { body: Buffer; contentType: string } {
	const boundary = `----n8nRobloxBoundary${randomBytes(12).toString('hex')}`;
	const chunks: Buffer[] = [];

	for (const part of parts) {
		if ('data' in part) {
			const fileName = part.fileName.replace(/"/g, '');
			chunks.push(
				Buffer.from(
					`--${boundary}\r\n` +
						`Content-Disposition: form-data; name="${part.name}"; filename="${fileName}"\r\n` +
						`Content-Type: ${part.contentType}\r\n\r\n`,
				),
				part.data,
				Buffer.from('\r\n'),
			);
		} else {
			chunks.push(
				Buffer.from(
					`--${boundary}\r\n` +
						`Content-Disposition: form-data; name="${part.name}"\r\n\r\n` +
						`${part.value}\r\n`,
				),
			);
		}
	}

	chunks.push(Buffer.from(`--${boundary}--\r\n`));

	return {
		body: Buffer.concat(chunks),
		contentType: `multipart/form-data; boundary=${boundary}`,
	};
}

function withBody(
	requestOptions: IHttpRequestOptions,
	body: Buffer,
	contentType: string,
): IHttpRequestOptions {
	requestOptions.body = body;
	requestOptions.headers = {
		...(requestOptions.headers ?? {}),
		'Content-Type': contentType,
	};
	return requestOptions;
}

async function getBinaryPart(
	context: IExecuteSingleFunctions,
	partName: string,
	binaryPropertyName: string,
	contentTypeOverride?: string,
): Promise<MultipartPart> {
	const binaryData = context.helpers.assertBinaryData(binaryPropertyName);
	const data = await context.helpers.getBinaryDataBuffer(binaryPropertyName);

	return {
		name: partName,
		data,
		fileName: binaryData.fileName ?? 'file',
		contentType: contentTypeOverride || binaryData.mimeType || 'application/octet-stream',
	};
}

function parseJsonObject(
	context: IExecuteSingleFunctions,
	value: unknown,
	parameterName: string,
): IDataObject {
	const parsed =
		value === '' || value === undefined || value === null
			? {}
			: typeof value === 'string'
				? (JSON.parse(value) as unknown)
				: value;

	if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
		throw new NodeOperationError(context.getNode(), `${parameterName} must be a JSON object`);
	}

	return parsed as IDataObject;
}

/**
 * Builds the multipart request for Create Asset and Update Asset.
 */
export async function assetMultipartPreSend(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const operation = this.getNodeParameter('operation') as string;
	const parts: MultipartPart[] = [];
	let request: IDataObject;
	let includeFile = true;

	if (operation === 'create_asset') {
		const creatorType = this.getNodeParameter('assetCreatorType') as string;
		const creatorId = this.getNodeParameter('assetCreatorId') as string;
		const options = this.getNodeParameter('assetCreateOptions', {}) as IDataObject;

		const creationContext: IDataObject = {
			creator: creatorType === 'group' ? { groupId: creatorId } : { userId: creatorId },
		};
		if (options.expectedPrice !== undefined && options.expectedPrice !== '') {
			creationContext.expectedPrice = options.expectedPrice;
		}
		if (options.assetPrivacy) {
			creationContext.assetPrivacy = options.assetPrivacy;
		}

		request = {
			assetType: this.getNodeParameter('assetType') as string,
			displayName: this.getNodeParameter('assetDisplayName') as string,
			description: this.getNodeParameter('assetDescription', '') as string,
			creationContext,
		};
	} else {
		const assetId = this.getNodeParameter('assetId') as string;
		const metadata = parseJsonObject(
			this,
			this.getNodeParameter('assetUpdateJson', '{}'),
			'assetUpdateJson',
		);
		request = { ...metadata, assetId };
		includeFile = this.getNodeParameter('assetUpdateContent', false) as boolean;
	}

	parts.push({ name: 'request', value: JSON.stringify(request) });

	if (includeFile) {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName') as string;
		const contentType = this.getNodeParameter('assetContentType', '') as string;
		parts.push(await getBinaryPart(this, 'fileContent', binaryPropertyName, contentType));
	}

	const { body, contentType } = buildMultipartBody(parts);
	return withBody(requestOptions, body, contentType);
}

/**
 * Builds the multipart request for Rollback Asset Version.
 */
export async function assetRollbackPreSend(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const assetId = this.getNodeParameter('assetId') as string;
	const versionNumber = this.getNodeParameter('assetVersionNumber') as string;
	const { body, contentType } = buildMultipartBody([
		{ name: 'assetVersion', value: `assets/${assetId}/versions/${versionNumber}` },
	]);
	return withBody(requestOptions, body, contentType);
}

/**
 * Builds the multipart request for developer product and game pass create/update operations.
 */
export async function productMultipartPreSend(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const operation = this.getNodeParameter('operation') as string;
	const parts: MultipartPart[] = [];

	if (operation.startsWith('create_')) {
		parts.push({ name: 'name', value: this.getNodeParameter('productName') as string });
	}

	const fields = this.getNodeParameter('productFields', {}) as IDataObject;
	for (const [key, value] of Object.entries(fields)) {
		if (value === undefined || value === null || value === '') continue;
		if (key === 'name' && operation.startsWith('create_')) continue;
		parts.push({ name: key, value: String(value) });
	}

	const imageBinaryProperty = this.getNodeParameter('productImageBinaryProperty', '') as string;
	if (imageBinaryProperty) {
		parts.push(await getBinaryPart(this, 'imageFile', imageBinaryProperty));
	}

	if (parts.length === 0) {
		throw new NodeOperationError(this.getNode(), 'Add at least one field to update');
	}

	const { body, contentType } = buildMultipartBody(parts);
	return withBody(requestOptions, body, contentType);
}

/**
 * Sends a place file as the raw request body for Publish Place.
 */
export async function placeFilePreSend(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName') as string;
	const binaryData = this.helpers.assertBinaryData(binaryPropertyName);
	const data = await this.helpers.getBinaryDataBuffer(binaryPropertyName);
	const fileName = (binaryData.fileName ?? '').toLowerCase();
	const contentType = fileName.endsWith('.rbxlx') ? 'application/xml' : 'application/octet-stream';
	return withBody(requestOptions, data, contentType);
}

/**
 * Encrypts a value with libsodium's sealed box construction (crypto_box_seal).
 */
export function sealedBoxEncrypt(plaintext: string, publicKeyBase64: string): string {
	const publicKey = new Uint8Array(Buffer.from(publicKeyBase64, 'base64'));
	if (publicKey.length !== nacl.box.publicKeyLength) {
		throw new Error('The universe public key must be a base64-encoded 32-byte key');
	}

	const ephemeral = nacl.box.keyPair();
	const nonceInput = new Uint8Array(ephemeral.publicKey.length + publicKey.length);
	nonceInput.set(ephemeral.publicKey);
	nonceInput.set(publicKey, ephemeral.publicKey.length);
	const nonce = blake2b(nonceInput, undefined, nacl.box.nonceLength);

	const message = new Uint8Array(Buffer.from(plaintext, 'utf8'));
	const boxed = nacl.box(message, nonce, publicKey, ephemeral.secretKey);

	const sealed = new Uint8Array(ephemeral.publicKey.length + boxed.length);
	sealed.set(ephemeral.publicKey);
	sealed.set(boxed, ephemeral.publicKey.length);

	return Buffer.from(sealed).toString('base64');
}

/**
 * Builds the Create Secret and Update Secret body, encrypting plaintext content when requested.
 */
export async function secretPreSend(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const operation = this.getNodeParameter('operation') as string;
	const universeId = this.getNodeParameter('universeId') as string;
	const contentMode = this.getNodeParameter('secretContentMode') as string;
	const content = this.getNodeParameter('secretContent') as string;
	const domain = this.getNodeParameter('secretDomain', '') as string;

	let secret = content;
	let keyId = this.getNodeParameter('secretKeyId', '') as string;

	if (contentMode === 'plaintext') {
		const publicKey = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'robloxCloudApi',
			{
				method: 'GET',
				url: `https://apis.roblox.com/cloud/v2/universes/${universeId}/secrets/public-key`,
				json: true,
			},
		)) as IDataObject;

		if (typeof publicKey.secret !== 'string' || typeof publicKey.key_id !== 'string') {
			throw new NodeOperationError(
				this.getNode(),
				'Roblox did not return a usable public key for this universe',
			);
		}

		secret = sealedBoxEncrypt(content, publicKey.secret);
		keyId = publicKey.key_id;
	}

	const body: IDataObject = { secret, key_id: keyId };
	if (operation === 'create_secret') {
		body.id = this.getNodeParameter('secretId') as string;
	}
	if (domain) {
		body.domain = domain;
	}

	requestOptions.body = body;
	return requestOptions;
}
