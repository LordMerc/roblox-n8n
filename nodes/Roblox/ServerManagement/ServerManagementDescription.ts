import type { INodeProperties } from 'n8n-workflow';

const serverManagementUrl = '=/server-management/v1/universes/{{ $parameter["universeId"] }}';
const placeUrl = `${serverManagementUrl}/places/{{ $parameter["placeId"] }}`;
const gameServersUrl = `${placeUrl}/versions/{{ $parameter["placeVersionNumber"] }}/game-servers`;

const launchRestartBody = `={{ (() => {
	const options = $parameter["restart_options"] || {};
	const parseObject = (value, name) => {
		if (value === undefined || value === "") return undefined;
		const parsed = typeof value === "string" ? JSON.parse(value) : value;
		if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
			throw new Error(name + " must be a JSON object");
		}
		return Object.keys(parsed).length > 0 ? parsed : undefined;
	};
	const places = parseObject(options.placesJson, "Places");
	const attributes = parseObject(options.attributesJson, "Attributes");
	return {
		...(options.bleedOffDurationMinutes ? { bleedOffDurationMinutes: options.bleedOffDurationMinutes } : {}),
		...(places ? { places } : {}),
		...(attributes ? { attributes } : {}),
	};
})() }}`;

export const serverManagementOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['serverManagement'],
			},
		},
		options: [
			{
				name: 'Forecast Restart (Beta)',
				value: 'forecast_restart',
				description: 'Forecast how many servers and players a universe restart would affect',
				action: 'Forecast restart',
				routing: {
					request: {
						method: 'GET',
						url: `${serverManagementUrl}/restarts:forecast`,
					},
				},
			},
			{
				name: 'Get Game Server Filter Options (Beta)',
				value: 'get_game_server_filter_options',
				description: 'Get the filters available when listing game servers for a place',
				action: 'Get game server filter options',
				routing: {
					request: {
						method: 'GET',
						url: `${placeUrl}/game-servers:filter-options`,
						qs: {
							Filter: '={{ $parameter["filterOptionsFilter"] || undefined }}',
						},
					},
				},
			},
			{
				name: 'Launch Restart (Beta)',
				value: 'launch_restart',
				description:
					'Restart game servers in a universe, optionally with a bleed-off period and per-place version filters',
				action: 'Launch restart',
				routing: {
					request: {
						method: 'POST',
						url: `${serverManagementUrl}/restarts`,
						body: launchRestartBody,
					},
				},
			},
			{
				name: 'List Game Server Logs (Beta)',
				value: 'list_game_server_logs',
				description: 'List log entries from a running game server',
				action: 'List game server logs',
				routing: {
					request: {
						method: 'GET',
						url: `${gameServersUrl}/{{ $parameter["jobId"] }}/logs`,
						qs: {
							MaxPageSize: '={{ $parameter["server_query"].maxPageSize }}',
							PageToken: '={{ $parameter["server_query"].pageToken }}',
							OrderBy: '={{ $parameter["server_query"].orderBy }}',
							Filter: '={{ $parameter["server_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Game Servers (Beta)',
				value: 'list_game_servers',
				description: 'List the running game servers for a place version',
				action: 'List game servers',
				routing: {
					request: {
						method: 'GET',
						url: gameServersUrl,
						qs: {
							MaxPageSize: '={{ $parameter["server_query"].maxPageSize }}',
							PageToken: '={{ $parameter["server_query"].pageToken }}',
							OrderBy: '={{ $parameter["server_query"].orderBy }}',
							Filter: '={{ $parameter["server_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Restarts (Beta)',
				value: 'list_restarts',
				description: 'List the status of restarts for a universe',
				action: 'List restarts',
				routing: {
					request: {
						method: 'GET',
						url: `${serverManagementUrl}/restarts`,
					},
				},
			},
		],
		default: 'list_game_servers',
	},
];

const placeOperations = [
	'get_game_server_filter_options',
	'list_game_server_logs',
	'list_game_servers',
];

export const serverManagementFields: INodeProperties[] = [
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['serverManagement'],
			},
		},
	},
	{
		displayName: 'Place ID',
		name: 'placeId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['serverManagement'],
				operation: placeOperations,
			},
		},
	},
	{
		displayName: 'Place Version Number',
		name: 'placeVersionNumber',
		type: 'string',
		default: '',
		required: true,
		description: 'The place version the servers are running',
		displayOptions: {
			show: {
				resource: ['serverManagement'],
				operation: ['list_game_server_logs', 'list_game_servers'],
			},
		},
	},
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		default: '',
		required: true,
		description: 'The game server job ID',
		displayOptions: {
			show: {
				resource: ['serverManagement'],
				operation: ['list_game_server_logs'],
			},
		},
	},
	{
		displayName: 'Filter',
		name: 'filterOptionsFilter',
		type: 'string',
		default: '',
		description: 'A specific filter to describe. Leave empty to return every available filter.',
		displayOptions: {
			show: {
				resource: ['serverManagement'],
				operation: ['get_game_server_filter_options'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'server_query',
		type: 'collection',
		default: {},
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['serverManagement'],
				operation: ['list_game_server_logs', 'list_game_servers'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description:
					'A CEL filter. For logs, filter on severity or message_timestamp, for example severity == "Error".',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 25,
				description: 'The maximum number of results to return',
			},
			{
				displayName: 'Order By',
				name: 'orderBy',
				type: 'string',
				default: '',
				placeholder: 'uptime desc',
				description: 'One field to sort by. Append " desc" for descending order.',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'A page token from a previous call, used to fetch the next page',
			},
		],
	},
	{
		displayName: 'Restart Options',
		name: 'restart_options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		description: 'Leave empty to restart every server in every place right away',
		displayOptions: {
			show: {
				resource: ['serverManagement'],
				operation: ['launch_restart'],
			},
		},
		options: [
			{
				displayName: 'Attributes (JSON)',
				name: 'attributesJson',
				type: 'json',
				default: '{}',
				description:
					'A JSON object, at most 500 bytes, sent to game servers when the restart is scheduled',
			},
			{
				displayName: 'Bleed-Off Duration (Minutes)',
				name: 'bleedOffDurationMinutes',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 240,
				},
				default: 5,
				description:
					'Minutes before servers start restarting. Players are not matched to those servers during this time.',
			},
			{
				displayName: 'Places (JSON)',
				name: 'placesJson',
				type: 'json',
				default: '{}',
				description:
					'Map of place ID to a filter, for example {"123": {"excludeCurrentVersion": true}} or {"123": {"versions": [41, 42]}}. Leave empty to restart all places.',
			},
		],
	},
];
