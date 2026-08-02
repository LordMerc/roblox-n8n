import type { INodeProperties } from 'n8n-workflow';

const notificationBody = `={{ ((parametersValue) => {
	const parameters =
		parametersValue === "" || parametersValue === undefined
			? {}
			: typeof parametersValue === "string"
				? JSON.parse(parametersValue)
				: parametersValue;

	if (parameters === null || Array.isArray(parameters) || typeof parameters !== "object") {
		throw new Error("notificationParametersJson must be a JSON object");
	}

	return {
		source: {
			universe: "universes/" + $parameter["universeId"],
		},
		payload: {
			type: "MOMENT",
			messageId: $parameter["notificationMessageId"],
			...(Object.keys(parameters).length > 0 ? { parameters } : {}),
			...($parameter["notificationLaunchData"]
				? { joinExperience: { launchData: $parameter["notificationLaunchData"] } }
				: {}),
			...($parameter["notificationAnalyticsCategory"]
				? { analyticsData: { category: $parameter["notificationAnalyticsCategory"] } }
				: {}),
		},
	};
})($parameter["notificationParametersJson"]) }}`;

export const notificationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['notification'],
			},
		},
		options: [
			{
				name: 'Create User Notification',
				value: 'create_user_notification',
				description: 'Create a notification for a Roblox user',
				action: 'Create user notification',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/users/{{ $parameter["userId"] }}/notifications',
						body: notificationBody,
					},
				},
			},
		],
		default: 'create_user_notification',
	},
];

export const notificationFields: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Roblox user ID that will receive the notification',
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['create_user_notification'],
			},
		},
	},
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The source Roblox universe ID',
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['create_user_notification'],
			},
		},
	},
	{
		displayName: 'Notification Message ID',
		name: 'notificationMessageId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Creator Dashboard notification-string asset ID',
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['create_user_notification'],
			},
		},
	},
	{
		displayName: 'Notification Parameters',
		name: 'notificationParametersJson',
		type: 'json',
		default: '{}',
		description: 'Optional notification parameter values using stringValue or int64Value objects',
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['create_user_notification'],
			},
		},
	},
	{
		displayName: 'Launch Data',
		name: 'notificationLaunchData',
		type: 'string',
		default: '',
		description: 'Optional launch data for the joined experience (maximum 200 bytes)',
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['create_user_notification'],
			},
		},
	},
	{
		displayName: 'Analytics Category',
		name: 'notificationAnalyticsCategory',
		type: 'string',
		default: '',
		description: 'Optional category used to group notification analytics',
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['create_user_notification'],
			},
		},
	},
];
