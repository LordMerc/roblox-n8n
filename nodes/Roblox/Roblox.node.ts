import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	NodeConnectionType,
} from 'n8n-workflow';
import { groupOperations, groupFields } from './GroupDescription';

export class Roblox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Roblox',
		name: 'roblox',
		icon: 'file:roblox.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Interact with Roblox API',
		defaults: {
			name: 'Roblox',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'robloxApi',
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
			...groupFields,
			...groupOperations,
		],
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();
		const returnData = [];

		for (let i = 0; i < items.length; i++) {
			try {
				// Example: get groupId from parameters
				const groupId = this.getNodeParameter('groupId', i) as string;

				// Get credentials
				const credentials = await this.getCredentials('robloxApi');

				// Example: Make an API call (replace with actual implementation)
				const response = await this.helpers.request({
					method: 'GET',
					url: `https://apis.roblox.com/cloud/v2/groups/${groupId}`,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${credentials.apiToken}`,
					},
				});
				returnData.push({ json: response });
			} catch (error) {
				//throw new Error(`Roblox Node Error: ${error}`);
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
