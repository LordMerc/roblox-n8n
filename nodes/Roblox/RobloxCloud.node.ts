import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

import { groupOperations, groupFields } from './Group/GroupDescription';
import { userOperations, userFields } from './User/UserDescription';
import { universeOperations, universeFields } from './Universe/UniverseDescription';
import { placeOperations, placeFields } from './Place/PlaceDescription';
import { engineOperations, engineFields } from './Engine/EngineDescription';
import { configOperations, configFields } from './Config/ConfigDescription';
import { teamCreateOperations, teamCreateFields } from './TeamCreate/TeamCreateDescription';
export class RobloxCloud implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Roblox Cloud',
		name: 'robloxCloud',
		icon: 'file:roblox.svg',
		group: ['transform'],
		usableAsTool: true,
		version: 1.5,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Interact with Roblox Cloud API',
		defaults: {
			name: 'Roblox Cloud',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		requestDefaults: {
			baseURL: 'https://apis.roblox.com',
			headers: {
				'Content-Type': 'application/json',
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
						name: 'Config',
						value: 'config',
					},
					{
						name: 'Engine',
						value: 'engine',
					},
					{
						name: 'Group',
						value: 'group',
					},
					{
						name: 'Place',
						value: 'place',
					},
					{
						name: 'Team Create',
						value: 'teamCreate',
					},
					{
						name: 'Universe',
						value: 'universe',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'group',
			},
			...configOperations,
			...configFields,

			...teamCreateOperations,
			...teamCreateFields,

			...engineOperations,
			...engineFields,

			...groupOperations,
			...groupFields,

			...userOperations,
			...userFields,

			...universeOperations,
			...universeFields,

			...placeOperations,
			...placeFields,
		],
	};
}
