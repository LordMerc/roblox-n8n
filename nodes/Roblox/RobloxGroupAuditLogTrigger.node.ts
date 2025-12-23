import {
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	INodeExecutionData,
	IDataObject,
	NodeConnectionType,
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
	{ name: 'Kick from Clan', value: '29' },
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

export class RobloxGroupAuditLogTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Roblox Group Audit Log Trigger',
		name: 'robloxGroupAuditLogTrigger',
		icon: 'file:roblox.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers when new entries appear in a Roblox Group audit log',
		defaults: {
			name: 'Roblox Group Audit Log Trigger',
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
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				required: true,
				description: 'The Roblox group ID to monitor',
			},
			{
				displayName: 'Action Type Filter',
				name: 'actionType',
				type: 'options',
				default: '',
				description: 'Filter for specific audit log action types',
				options: ACTION_TYPE_OPTIONS,
			},
			{
				displayName: 'User ID Filter',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter audit logs for a specific user ID (optional)',
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
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const groupId = this.getNodeParameter('groupId') as string;
		const actionType = this.getNodeParameter('actionType') as string;
		const userId = this.getNodeParameter('userId') as string;
		const limit = this.getNodeParameter('limit') as string;

		const credentials = await this.getCredentials('robloxCloudApi');

		// Get workflow static data to track last poll
		const webhookData = this.getWorkflowStaticData('node');
		const lastCreated = webhookData.lastCreated as string | undefined;

		// Build query parameters
		const qs: IDataObject = {
			limit,
			sortOrder: 'Desc', // Get newest first
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

			// Filter to only new entries since last poll
			let newEntries: IDataObject[];

			if (lastCreated) {
				const lastCreatedDate = new Date(lastCreated);
				newEntries = auditLogs.filter((entry) => {
					const entryDate = new Date(entry.created as string);
					return entryDate > lastCreatedDate;
				});
			} else {
				// First poll - return all entries (or just the most recent)
				// To avoid flooding on first activation, only return the latest entry
				newEntries = [auditLogs[0]];
			}

			if (newEntries.length === 0) {
				return null;
			}

			// Update last created timestamp to the newest entry
			webhookData.lastCreated = auditLogs[0].created as string;

			// Return new entries as trigger output
			const returnData: INodeExecutionData[] = newEntries.map((entry) => ({
				json: entry,
			}));

			return [returnData];
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to fetch audit log: ${error.message}`);
			}
			throw error;
		}
	}
}
