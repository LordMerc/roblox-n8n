import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

import { groupOperations, groupFields } from './GroupDescription';

export class Roblox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Roblox',
		name: 'roblox',
		icon: 'file:roblox.svg',
		group: ['transform'],
		version: 1.5,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Interact with Roblox Cloud API',
		defaults: {
			name: 'Roblox',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		requestDefaults: {
			baseURL: 'https://apis.roblox.com',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': '={{ $credentials.apiKey }}',
				Accept: 'application/json',
			},
		},
		credentials: [
			{
				name: 'robloxCloudApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Group',
						value: 'group',
					},
				],
				default: 'group',
			},
			...groupOperations,
			...groupFields,
		],
	};
}
