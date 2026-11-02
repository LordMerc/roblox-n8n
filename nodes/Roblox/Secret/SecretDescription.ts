import type { INodeProperties } from 'n8n-workflow';
import { secretPreSend } from '../GenericFunctions';

const secretsUrl = '=/cloud/v2/universes/{{ $parameter["universeId"] }}/secrets';

export const secretOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['secret'],
			},
		},
		options: [
			{
				name: 'Create Secret (Beta)',
				value: 'create_secret',
				description: 'Create a secret that game servers can use through HttpService',
				action: 'Create secret',
				routing: {
					request: {
						method: 'POST',
						url: secretsUrl,
					},
					send: {
						preSend: [secretPreSend],
					},
				},
			},
			{
				name: 'Delete Secret (Beta)',
				value: 'delete_secret',
				description: 'Delete a secret',
				action: 'Delete secret',
				routing: {
					request: {
						method: 'DELETE',
						url: `${secretsUrl}/{{ $parameter["secretId"] }}`,
					},
				},
			},
			{
				name: 'Get Public Key (Beta)',
				value: 'get_public_key',
				description: 'Get the universe public key used to encrypt secret content',
				action: 'Get public key',
				routing: {
					request: {
						method: 'GET',
						url: `${secretsUrl}/public-key`,
					},
				},
			},
			{
				name: 'List Secrets (Beta)',
				value: 'list_secrets',
				description: 'List the secrets in a universe. Secret values are never returned.',
				action: 'List secrets',
				routing: {
					request: {
						method: 'GET',
						url: secretsUrl,
						qs: {
							limit: '={{ $parameter["secret_list_query"].limit }}',
							cursor: '={{ $parameter["secret_list_query"].cursor }}',
						},
					},
				},
			},
			{
				name: 'Update Secret (Beta)',
				value: 'update_secret',
				description: 'Replace the content or domain of a secret, for example to rotate an API key',
				action: 'Update secret',
				routing: {
					request: {
						method: 'PATCH',
						url: `${secretsUrl}/{{ $parameter["secretId"] }}`,
					},
					send: {
						preSend: [secretPreSend],
					},
				},
			},
		],
		default: 'list_secrets',
	},
];

const writeOperations = ['create_secret', 'update_secret'];

export const secretFields: INodeProperties[] = [
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The universe ID that owns the secrets',
		displayOptions: {
			show: {
				resource: ['secret'],
			},
		},
	},
	{
		displayName: 'Secret ID',
		name: 'secretId',
		// eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
		type: 'string',
		default: '',
		required: true,
		placeholder: 'discord_webhook',
		description:
			'The secret name: letters, numbers, and underscores, 1-64 characters, not starting with a number',
		displayOptions: {
			show: {
				resource: ['secret'],
				operation: ['create_secret', 'delete_secret', 'update_secret'],
			},
		},
	},
	{
		displayName: 'Content Format',
		name: 'secretContentMode',
		type: 'options',
		options: [
			{
				name: 'Plain Text (Encrypt for Me)',
				value: 'plaintext',
				description:
					'Fetches the universe public key and encrypts the content with a libsodium sealed box before sending',
			},
			{
				name: 'Already Encrypted (Base64)',
				value: 'encrypted',
				description: 'Content you already encrypted with the universe public key',
			},
		],
		default: 'plaintext',
		displayOptions: {
			show: {
				resource: ['secret'],
				operation: writeOperations,
			},
		},
	},
	{
		displayName: 'Secret Content',
		name: 'secretContent',
		type: 'string',
		typeOptions: {
			password: true,
		},
		default: '',
		required: true,
		description: 'The secret value, such as an API key',
		displayOptions: {
			show: {
				resource: ['secret'],
				operation: writeOperations,
			},
		},
	},
	{
		displayName: 'Key ID',
		name: 'secretKeyId',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		required: true,
		description: 'The key_id from Get Public Key that was used to encrypt the content',
		displayOptions: {
			show: {
				resource: ['secret'],
				operation: writeOperations,
				secretContentMode: ['encrypted'],
			},
		},
	},
	{
		displayName: 'Domain',
		name: 'secretDomain',
		// eslint-disable-next-line n8n-nodes-base/node-param-type-options-password-missing
		type: 'string',
		default: '',
		placeholder: '*.example.com',
		description:
			'Domain the secret can be sent to through HttpService. Use * for any domain. Leave empty for a private key that cannot be sent in headers or URLs.',
		displayOptions: {
			show: {
				resource: ['secret'],
				operation: writeOperations,
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'secret_list_query',
		type: 'collection',
		default: {},
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['secret'],
				operation: ['list_secrets'],
			},
		},
		options: [
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				description: 'The cursor from a previous response, used to fetch the next page',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
		],
	},
];
