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

export class RobloxCloudJoinRequestTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Roblox Group Join Request Trigger',
		name: 'robloxCloudJoinRequestTrigger',
		icon: 'file:roblox.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers when new join requests appear for a Roblox Group',
		defaults: {
			name: 'Roblox Group Join Request Trigger',
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
				description: 'The Roblox group ID to monitor for join requests',
			},
			{
				displayName: 'Max Results Per Poll',
				name: 'maxPageSize',
				type: 'options',
				default: '20',
				description: 'Maximum number of join requests to return per poll (max 20)',
				options: [
					{ name: '5', value: '5' },
					{ name: '10', value: '10' },
					{ name: '20', value: '20' },
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const groupId = this.getNodeParameter('groupId') as string;
		const maxPageSize = this.getNodeParameter('maxPageSize') as string;

		const credentials = await this.getCredentials('robloxCloudApi');

		// Get workflow static data to track seen join requests
		const webhookData = this.getWorkflowStaticData('node');
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

			// Filter for new join requests we haven't seen before
			const newRequests = joinRequests.filter((request) => {
				const requestPath = request.path as string;
				return !seenRequestIds.includes(requestPath);
			});

			// First poll - return latest request and initialize tracking
			if (seenRequestIds.length === 0 && joinRequests.length > 0) {
				// Track all current request IDs
				webhookData.seenRequestIds = joinRequests.map((r) => r.path as string);
				// Return the first one for testing
				const returnData: INodeExecutionData[] = [{ json: joinRequests[0] }];
				return [returnData];
			}

			if (newRequests.length === 0) {
				return null;
			}

			// Update seen request IDs with new ones
			const newIds = newRequests.map((r) => r.path as string);
			webhookData.seenRequestIds = [...seenRequestIds, ...newIds];

			// Keep only the last 100 IDs to prevent memory bloat
			if ((webhookData.seenRequestIds as string[]).length > 100) {
				webhookData.seenRequestIds = (webhookData.seenRequestIds as string[]).slice(-100);
			}

			// Return new requests as trigger output
			const returnData: INodeExecutionData[] = newRequests.map((request) => ({
				json: request,
			}));

			return [returnData];
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject);
		}
	}
}
