import type { INodeProperties } from 'n8n-workflow';

const analyticsUrl = '=/analytics-query-api/v1/universes/{{ $parameter["universeId"] }}';

const analyticsBody = (includeBreakdown: boolean) => `={{ (() => {
	const options = $parameter["analytics_options"] || {};
	const list = (value) =>
		(value || "")
			.split(",")
			.map((entry) => entry.trim())
			.filter((entry) => entry.length > 0);
	const filterValue = options.filterJson;
	const filter =
		filterValue === undefined || filterValue === ""
			? []
			: typeof filterValue === "string"
				? JSON.parse(filterValue)
				: filterValue;
	if (!Array.isArray(filter)) {
		throw new Error("Filter must be a JSON array");
	}
	const toUtc = (value) => {
		const text = String(value || "");
		return /([zZ]|[+-]\\d\\d:?\\d\\d)$/.test(text) ? text : text + "Z";
	};
	const granularity = $parameter["analyticsGranularity"];
	const groups = list(${includeBreakdown ? 'options.breakdown' : '$parameter["analyticsDimensions"]'});
	return {
		metric: $parameter["analyticsMetric"],
		startTime: toUtc($parameter["analyticsStartTime"]),
		endTime: toUtc($parameter["analyticsEndTime"]),
		...(granularity ? { granularity } : {}),
		...(groups.length > 0 ? { ${includeBreakdown ? 'breakdown' : 'dimensions'}: groups } : {}),
		...(filter.length > 0 ? { filter } : {}),
		...(options.limit ? { limit: options.limit } : {}),
	};
})() }}`;

export const analyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['analytics'],
			},
		},
		options: [
			{
				name: 'Get Dimension Values Operation (Beta)',
				value: 'get_dimension_values_operation',
				description: 'Get the result of a long-running dimension values query',
				action: 'Get dimension values operation',
				routing: {
					request: {
						method: 'GET',
						url: `${analyticsUrl}/operations/dimension-values/{{ $parameter["operationId"] }}`,
					},
				},
			},
			{
				name: 'Get Metrics Operation (Beta)',
				value: 'get_metrics_operation',
				description: 'Get the result of a long-running metrics query',
				action: 'Get metrics operation',
				routing: {
					request: {
						method: 'GET',
						url: `${analyticsUrl}/operations/metrics/{{ $parameter["operationId"] }}`,
					},
				},
			},
			{
				name: 'Query Dimension Values (Beta)',
				value: 'query_dimension_values',
				description: 'Get the values that dimensions such as platform or country take for a metric',
				action: 'Query dimension values',
				routing: {
					request: {
						method: 'POST',
						url: `${analyticsUrl}/dimension-values`,
						body: analyticsBody(false),
					},
				},
			},
			{
				name: 'Query Metrics (Beta)',
				value: 'query_metrics',
				description: 'Query time series data for a metric such as daily active users or revenue',
				action: 'Query metrics',
				routing: {
					request: {
						method: 'POST',
						url: `${analyticsUrl}/metrics`,
						body: analyticsBody(true),
					},
				},
			},
		],
		default: 'query_metrics',
	},
];

const queryOperations = ['query_dimension_values', 'query_metrics'];

const granularityOptions = [
	{ name: 'One Minute', value: 'OneMinute' },
	{ name: 'Half Hour', value: 'HalfHour' },
	{ name: 'One Hour', value: 'OneHour' },
	{ name: 'One Day', value: 'OneDay' },
	{ name: 'One Week', value: 'OneWeek' },
	{ name: 'One Month', value: 'OneMonth' },
	{ name: 'None', value: 'None' },
];

export const analyticsFields: INodeProperties[] = [
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The universe ID to query',
		displayOptions: {
			show: {
				resource: ['analytics'],
			},
		},
	},
	{
		displayName: 'Operation ID',
		name: 'operationId',
		type: 'string',
		default: '',
		required: true,
		description: 'The operation ID returned by a previous query',
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['get_dimension_values_operation', 'get_metrics_operation'],
			},
		},
	},
	{
		displayName: 'Metric',
		name: 'analyticsMetric',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'DailyActiveUsers',
		description: 'The metric to query. See the Roblox analytics metrics reference for names.',
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: queryOperations,
			},
		},
	},
	{
		displayName: 'Start Time',
		name: 'analyticsStartTime',
		type: 'dateTime',
		default: '',
		required: true,
		description:
			'The inclusive start of the time range. Times without an offset are treated as UTC.',
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: queryOperations,
			},
		},
	},
	{
		displayName: 'End Time',
		name: 'analyticsEndTime',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'The exclusive end of the time range',
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: queryOperations,
			},
		},
	},
	{
		displayName: 'Granularity',
		name: 'analyticsGranularity',
		type: 'options',
		options: granularityOptions,
		default: 'OneDay',
		required: true,
		description: 'The time granularity of the data points',
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['query_metrics'],
			},
		},
	},
	{
		displayName: 'Granularity',
		name: 'analyticsGranularity',
		type: 'options',
		options: [{ name: 'Not Set', value: '' }, ...granularityOptions],
		default: '',
		description: 'Optional time granularity used to resolve dimension values',
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['query_dimension_values'],
			},
		},
	},
	{
		displayName: 'Dimensions',
		name: 'analyticsDimensions',
		type: 'string',
		default: '',
		placeholder: 'Platform,Country',
		description: 'Comma-separated dimension names to get values for',
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['query_dimension_values'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'analytics_options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: queryOperations,
			},
		},
		options: [
			{
				displayName: 'Breakdown',
				name: 'breakdown',
				type: 'string',
				default: '',
				placeholder: 'Platform',
				description: 'Comma-separated dimensions to group results by (metrics queries only)',
			},
			{
				displayName: 'Filter (JSON)',
				name: 'filterJson',
				type: 'json',
				default: '[]',
				description:
					'JSON array of filters, for example [{"dimension": "Platform", "operation": "In", "values": ["Desktop"]}]. Operations: In, NotIn, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, Match.',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
		],
	},
];
