import { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

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
				},
				{
					name: 'Group API Key',
					value: 'group',
					description: 'API key for group-level access',
				},
			],
			default: 'user',
			description: 'Select the type of API key you are using.',
		},
		{
			displayName: 'API Token',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your Roblox Cloud API token. Obtain it from the Cloud dashboard.',
		},
	];
}
