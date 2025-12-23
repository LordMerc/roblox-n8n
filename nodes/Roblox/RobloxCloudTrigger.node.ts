import {
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	INodeExecutionData,
	IDataObject,
	NodeConnectionType,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

// Action types from the Roblox API (0-69)
const ACTION_TYPE_OPTIONS = [
	{ name: 'All Actions', value: '' },
	{ name: 'Delete Post', value: '0' },
	{ name: 'Remove Member', value: '1' },
	{ name: 'Accept Join Request', value: '2' },
	{ name: 'Decline Join Request', value: '3' },
	{ name: 'Post Status', value: '4' },
	{ name: 'Change Rank', value: '5' },
	{ name: 'Buy Ad', value: '6' },
	{ name: 'Send Ally Request', value: '7' },
	{ name: 'Create Enemy', value: '8' },
	{ name: 'Accept Ally Request', value: '9' },
	{ name: 'Decline Ally Request', value: '10' },
	{ name: 'Delete Ally', value: '11' },
	{ name: 'Delete Enemy', value: '12' },
	{ name: 'Add Group Place', value: '13' },
	{ name: 'Remove Group Place', value: '14' },
	{ name: 'Create Items', value: '15' },
	{ name: 'Configure Items', value: '16' },
	{ name: 'Spend Group Funds', value: '17' },
	{ name: 'Change Owner', value: '18' },
	{ name: 'Delete', value: '19' },
	{ name: 'Adjust Currency Amounts', value: '23' },
	{ name: 'Abandon', value: '24' },
	{ name: 'Claim', value: '25' },
	{ name: 'Rename', value: '26' },
	{ name: 'Change Description', value: '27' },
	{ name: 'Invite to Clan', value: '28' },
	{ name: 'Kick From Clan', value: '29' },
	{ name: 'Cancel Clan Invite', value: '30' },
	{ name: 'Buy Clan', value: '31' },
	{ name: 'Create Group Asset', value: '32' },
	{ name: 'Update Group Asset', value: '33' },
	{ name: 'Configure Group Asset', value: '34' },
	{ name: 'Revert Group Asset', value: '35' },
	{ name: 'Create Group Developer Product', value: '36' },
	{ name: 'Configure Group Game', value: '37' },
	{ name: 'Lock', value: '38' },
	{ name: 'Unlock', value: '39' },
	{ name: 'Create Game Pass', value: '40' },
	{ name: 'Create Badge', value: '41' },
	{ name: 'Configure Badge', value: '42' },
	{ name: 'Save Place', value: '43' },
	{ name: 'Publish Place', value: '44' },
	{ name: 'Update Roleset Rank', value: '45' },
	{ name: 'Update Roleset Data', value: '46' },
];

export class RobloxCloudTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Roblox Cloud Trigger',
		name: 'robloxCloudTrigger',
		icon: 'file:roblox.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers on Roblox Group events (Audit Log, Join Requests)',
		defaults: {
			name: 'Roblox Cloud Trigger',
		},
		polling: true,
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'robloxCloudApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				default: 'auditLog',
				required: true,
				description: 'The type of event to trigger on',
				options: [
					{
						name: 'Group Audit Log Entry',
						value: 'auditLog',
						description: 'Triggers when new audit log entries appear',
					},
					{
						name: 'Group Join Request',
						value: 'joinRequest',
						description: 'Triggers when new join requests appear',
					},
				],
			},
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				required: true,
				description: 'The Roblox group ID to monitor',
			},
			// Audit Log specific fields
			{
				displayName: 'Action Type Filter',
				name: 'actionType',
				type: 'options',
				default: '',
				description: 'Filter for specific audit log action types',
				options: ACTION_TYPE_OPTIONS,
				displayOptions: {
					show: {
						eventType: ['auditLog'],
					},
				},
			},
			{
				displayName: 'User ID Filter',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter audit logs for a specific user ID (optional)',
				displayOptions: {
					show: {
						eventType: ['auditLog'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'options',
				default: '50',
				description: 'Maximum number of results per poll',
				options: [
					{ name: '10', value: '10' },
					{ name: '25', value: '25' },
					{ name: '50', value: '50' },
					{ name: '100', value: '100' },
				],
				displayOptions: {
					show: {
						eventType: ['auditLog'],
					},
				},
			},
			// Join Request specific fields
			{
				displayName: 'Max Results Per Poll',
				name: 'maxPageSize',
				type: 'options',
				default: '20',
				description: 'Maximum join requests to return per poll (max 20)',
				options: [
					{ name: '5', value: '5' },
					{ name: '10', value: '10' },
					{ name: '20', value: '20' },
				],
				displayOptions: {
					show: {
						eventType: ['joinRequest'],
					},
				},
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const eventType = this.getNodeParameter('eventType') as string;
		const groupId = this.getNodeParameter('groupId') as string;
		const credentials = await this.getCredentials('robloxCloudApi');
		const webhookData = this.getWorkflowStaticData('node');

		if (eventType === 'auditLog') {
			// Poll Audit Log
			const actionType = this.getNodeParameter('actionType') as string;
			const userId = this.getNodeParameter('userId') as string;
			const limit = this.getNodeParameter('limit') as string;
			const lastCreated = webhookData.lastCreated as string | undefined;

			const qs: IDataObject = {
				limit,
				sortOrder: 'Desc',
			};

			if (actionType) {
				qs.actionType = actionType;
			}
			if (userId) {
				qs.userId = userId;
			}

			try {
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: `https://apis.roblox.com/legacy-groups/v1/groups/${groupId}/audit-log`,
					headers: {
						'x-api-key': credentials.apiKey as string,
						Accept: 'application/json',
					},
					qs,
					json: true,
				});

				const auditLogs = response.data as IDataObject[];

				if (!auditLogs || auditLogs.length === 0) {
					return null;
				}

				let newEntries: IDataObject[];

				if (lastCreated) {
					const lastCreatedDate = new Date(lastCreated);
					newEntries = auditLogs.filter((entry) => {
						const entryDate = new Date(entry.created as string);
						return entryDate > lastCreatedDate;
					});
				} else {
					webhookData.lastCreated = auditLogs[0].created as string;
					newEntries = [auditLogs[0]];
				}

				if (newEntries.length === 0) {
					return null;
				}

				webhookData.lastCreated = auditLogs[0].created as string;

				const returnData: INodeExecutionData[] = newEntries.map((entry) => ({
					json: entry,
				}));

				return [returnData];
			} catch (error) {
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		} else if (eventType === 'joinRequest') {
			// Poll Join Requests
			const maxPageSize = this.getNodeParameter('maxPageSize') as string;
			const seenRequestIds = (webhookData.seenRequestIds as string[]) || [];

			try {
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url: `https://apis.roblox.com/cloud/v2/groups/${groupId}/join-requests`,
					headers: {
						'x-api-key': credentials.apiKey as string,
						Accept: 'application/json',
					},
					qs: {
						maxPageSize: parseInt(maxPageSize, 10),
					},
					json: true,
				});

				const joinRequests = (response.groupJoinRequests || []) as IDataObject[];

				if (!joinRequests || joinRequests.length === 0) {
					return null;
				}

				const newRequests = joinRequests.filter((request) => {
					const requestPath = request.path as string;
					return !seenRequestIds.includes(requestPath);
				});

				// First poll - return latest and initialize tracking
				if (seenRequestIds.length === 0 && joinRequests.length > 0) {
					webhookData.seenRequestIds = joinRequests.map((r) => r.path as string);
					const returnData: INodeExecutionData[] = [{ json: joinRequests[0] }];
					return [returnData];
				}

				if (newRequests.length === 0) {
					return null;
				}

				const newIds = newRequests.map((r) => r.path as string);
				webhookData.seenRequestIds = [...seenRequestIds, ...newIds];

				// Keep only the last 100 IDs
				if ((webhookData.seenRequestIds as string[]).length > 100) {
					webhookData.seenRequestIds = (webhookData.seenRequestIds as string[]).slice(-100);
				}

				const returnData: INodeExecutionData[] = newRequests.map((request) => ({
					json: request,
				}));

				return [returnData];
			} catch (error) {
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return null;
	}
}
