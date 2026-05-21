import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RobloxCloudApi implements ICredentialType {
	name = 'robloxCloudApi';
	displayName = 'Roblox Cloud API';
	documentationUrl = 'https://create.roblox.com/docs/cloud';
	domain = 'https://apis.roblox.com';
	icon?: Icon | undefined;
	properties: INodeProperties[] = [
		{
			displayName: 'API Key Type',
			name: 'apiKeyType',
			type: 'options',
			options: [
				{
					name: 'User API Key',
					value: 'user',
					description: 'API key for user-level access',
				}
			],
			default: 'user',
			description: 'Select the type of API key you are using.',
		},
		{
			displayName: 'API Token',
			name: 'apiKey',
			type: 'string',
			required: true,
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your Roblox Cloud API token. Obtain it from the Cloud dashboard.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://apis.roblox.com',
			url: '/cloud/v2/users/1',
		},
	};
}
