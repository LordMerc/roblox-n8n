import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

import { placeOperations, placeFields } from './LegacyPlace/LegacyPlaceDescription';

export class RobloxLegacy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Roblox Legacy',
		name: 'robloxLegacy',
		icon: 'file:roblox.svg',
		group: ['transform'],
		usableAsTool: true,
		version: 1.5,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Interact with Roblox Legacy API',
		defaults: {
			name: 'Roblox Legacy',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Legacy Place',
						value: 'legacy_Place',
					},
				],
				default: 'legacy_Place',
			},
			...placeOperations,
			...placeFields,
		],
	};
}
