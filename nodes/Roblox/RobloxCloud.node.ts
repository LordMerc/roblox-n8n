import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

import { groupOperations, groupFields } from './Group/GroupDescription';
import { userOperations, userFields } from './User/UserDescription';
import { universeOperations, universeFields } from './Universe/UniverseDescription';
import { placeOperations, placeFields } from './Place/PlaceDescription';
import { engineOperations, engineFields } from './Engine/EngineDescription';
import { configOperations, configFields } from './Config/ConfigDescription';
import { teamCreateOperations, teamCreateFields } from './TeamCreate/TeamCreateDescription';
import { storageOperations, storageFields } from './Storage/StorageDescription';
import {
	luauExecutionOperations,
	luauExecutionFields,
} from './LuauExecution/LuauExecutionDescription';
import {
	notificationOperations,
	notificationFields,
} from './Notification/NotificationDescription';
export class RobloxCloud implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Roblox Cloud',
		name: 'robloxCloud',
		icon: 'file:roblox.svg',
		group: ['transform'],
		usableAsTool: true,
		version: 1.5,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Access Roblox Open Cloud APIs for groups, users, universes, places, storage, and more',
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
						name: 'Luau Execution',
						value: 'luauExecution',
					},
					{
						name: 'Notification',
						value: 'notification',
					},
					{
						name: 'Place',
						value: 'place',
					},
					{
						name: 'Storage',
						value: 'storage',
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

			...storageOperations,
			...storageFields,

			...engineOperations,
			...engineFields,

			...groupOperations,
			...groupFields,

			...luauExecutionOperations,
			...luauExecutionFields,

			...notificationOperations,
			...notificationFields,

			...userOperations,
			...userFields,

			...universeOperations,
			...universeFields,

			...placeOperations,
			...placeFields,
		],
	};
}
