import type { INodeProperties } from 'n8n-workflow';

export const universeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['universe'],
			},
		},
		options: [
			{
				name: 'Get Universe',
				value: 'get_universe',
				description: 'Get details of a universe',
				action: 'Get universe',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'Publish Universe Message',
				value: 'publish_universe_message',
				description: 'Publish a message to a universe live servers',
				action: 'Publish universe message',
				hint: 'Publish a message to a universe live servers',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}:publishMessage',
						body: {
							topic: '={{ $parameter["topic"] }}',
							message: '={{ $parameter["message"] }}',
						},
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'Restart Universe Servers',
				value: 'restart_universe_servers',
				description: 'Restart the servers of a universe',
				action: 'Restart universe servers',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}:restartServers',
						body: {},
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
		],
		default: 'get_universe',
	},
];

export const universeFields: INodeProperties[] = [
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Universe ID of the place',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['get_universe', 'publish_universe_message', 'restart_universe_servers'],
			},
		},
	},
	{
		displayName: 'Topic',
		name: 'topic',
		type: 'string',
		default: '',
		required: true,
		description: 'The topic to publish the message to',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['publish_universe_message'],
			},
		},
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		description: 'The message to publish to the universe',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['publish_universe_message'],
			},
		},
	},
];
