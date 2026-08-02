import type { INodeProperties } from 'n8n-workflow';

const GROUP_AUDIT_ACTION_TYPE_OPTIONS = [
	{ name: 'All Actions', value: '' },
	...[
		'DeletePost',
		'RemoveMember',
		'AcceptJoinRequest',
		'DeclineJoinRequest',
		'PostStatus',
		'ChangeRank',
		'BuyAd',
		'SendAllyRequest',
		'CreateEnemy',
		'AcceptAllyRequest',
		'DeclineAllyRequest',
		'DeleteAlly',
		'DeleteEnemy',
		'AddGroupPlace',
		'RemoveGroupPlace',
		'CreateItems',
		'ConfigureItems',
		'SpendGroupFunds',
		'ChangeOwner',
		'Delete',
		'AdjustCurrencyAmounts',
		'Abandon',
		'Claim',
		'Rename',
		'ChangeDescription',
		'InviteToClan',
		'KickFromClan',
		'CancelClanInvite',
		'BuyClan',
		'CreateGroupAsset',
		'UpdateGroupAsset',
		'ConfigureGroupAsset',
		'RevertGroupAsset',
		'CreateGroupDeveloperProduct',
		'ConfigureGroupGame',
		'CreateGroupDeveloperSubscriptionProduct',
		'Lock',
		'Unlock',
		'CreateGamePass',
		'CreateBadge',
		'ConfigureBadge',
		'SavePlace',
		'PublishPlace',
		'UpdateRolesetRank',
		'UpdateRolesetData',
		'BanMember',
		'UnbanMember',
		'CreateForumCategory',
		'UpdateForumCategory',
		'ArchiveForumCategory',
		'DeleteForumCategory',
		'DeleteForumPost',
		'DeleteForumComment',
		'PinForumPost',
		'UnpinForumPost',
		'LockForumPost',
		'UnlockForumPost',
		'CreateRoleset',
		'DeleteRoleset',
		'CreateCommerceProduct',
		'SetCommerceProductActive',
		'ArchiveCommerceProduct',
		'AcceptCommerceProductBundlingFee',
		'SetCommerceProductInactive',
		'ConnectMerchant',
		'DisconnectMerchant',
		'JoinGroup',
		'LeaveGroup',
		'UpdateGroupIcon',
		'UpdateGroupCoverPhoto',
		'AssignRole',
		'UnassignRole',
	].map((value) => ({
		name: value.replace(/([a-z])([A-Z])/g, '$1 $2'),
		value,
	})),
];

const GROUP_FORUM_POST_VIEW_OPTIONS = [
	{
		name: 'Unspecified',
		value: 'VIEW_UNSPECIFIED',
	},
	{
		name: 'Full',
		value: 'FULL',
	},
	{
		name: 'Full With First Comment',
		value: 'FULL_WITH_FIRST_COMMENT',
	},
];

const GROUP_NOTIFICATION_TYPE_OPTIONS = [
	{
		name: 'Announcement Created Notification',
		value: 0,
	},
	{
		name: 'Forum Post Created Notification',
		value: 1,
	},
	{
		name: 'Forum Comment Created Notification',
		value: 2,
	},
	{
		name: 'Forum Comment Reply Created Notification',
		value: 3,
	},
	{
		name: 'Forum Subscriber Notification',
		value: 4,
	},
];

const levelOptions = (max: number) =>
	Array.from({ length: max + 1 }, (_, value) => ({
		name: `Level ${value}`,
		value,
	}));

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['group'],
			},
		},
		options: [
			{
				name: 'Accept Group Join Request',
				value: 'accept_join_request',
				description: 'Accept a group join request',
				action: 'Accept group join request',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/join-requests/{{ $parameter["joinRequestId"] }}:accept',
						body: {},
					},
				},
			},
			{
				name: 'Assign Member Role',
				value: 'assign_member_role',
				description: 'Assign a role to a group member',
				action: 'Assign group member role',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/memberships/{{ $parameter["membershipId"] }}:assignRole',
						body: {
							role: '=groups/{{ $parameter["groupId"] }}/roles/{{ $parameter["roleId"] }}',
						},
					},
				},
			},
			{
				name: 'Decline Group Join Request',
				value: 'decline_join_request',
				description: 'Decline a group join request',
				action: 'Decline group join request',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/join-requests/{{ $parameter["joinRequestId"] }}:decline',
						body: {},
					},
				},
			},
			{
				name: 'Get Group',
				value: 'get_group',
				description: 'Retrieve a group',
				action: 'Get group',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}',
					},
				},
			},
			{
				name: 'Get Group Audit Log',
				value: 'get_audit_log',
				description: "Retrieve a group's audit log",
				action: 'Get group audit log',
				routing: {
					request: {
						method: 'GET',
						url: '=/legacy-groups/v1/groups/{{ $parameter["groupId"] }}/audit-log',
						qs: {
							actionType: '={{ $parameter["group_audit_log_query"].actionType }}',
							userId: '={{ $parameter["group_audit_log_query"].userId }}',
							limit: '={{ $parameter["group_audit_log_query"].limit }}',
							cursor: '={{ $parameter["group_audit_log_query"].cursor }}',
							sortOrder: '={{ $parameter["group_audit_log_query"].sortOrder }}',
						},
					},
				},
			},
			{
				name: 'Get Group Policies',
				value: 'get_group_policies',
				description: 'Retrieve group policy info used for compliance',
				action: 'Get group policies',
				routing: {
					request: {
						method: 'POST',
						url: '=/legacy-groups/v1/groups/policies',
						body: {
							groupIds:
								'={{ $parameter["groupPolicyGroupIds"].split(",").map(id => id.trim()).filter(Boolean).map(id => Number(id)) }}',
						},
					},
				},
			},
			{
				name: 'Get Group Role',
				value: 'get_role',
				description: 'Retrieve a group role',
				action: 'Get group role',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/roles/{{ $parameter["roleId"] }}',
					},
				},
			},
			{
				name: 'Get Group Settings',
				value: 'get_settings',
				description: "Retrieve a group's settings",
				action: 'Get group settings',
				routing: {
					request: {
						method: 'GET',
						url: '=/legacy-groups/v1/groups/{{ $parameter["groupId"] }}/settings',
					},
				},
			},
			{
				name: 'Get Manageable Groups',
				value: 'get_manageable_groups',
				description: 'Retrieve groups the authenticated user can manage',
				action: 'Get manageable groups',
				routing: {
					request: {
						method: 'GET',
						url: '=/legacy-develop/v1/user/groups/canmanage',
					},
				},
			},
			{
				name: 'Get Pending Groups',
				value: 'get_pending_groups',
				description: 'Retrieve groups the authenticated user has requested to join',
				action: 'Get pending groups',
				routing: {
					request: {
						method: 'GET',
						url: '=/legacy-groups/v1/user/groups/pending',
					},
				},
			},
			{
				name: 'List Group Forum Categories',
				value: 'list_forum_categories',
				description: 'List forum categories in a group',
				action: 'List group forum categories',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/forum-categories',
						qs: {
							maxPageSize:
								'={{ $parameter["group_forum_categories_query"].maxPageSize }}',
							pageToken: '={{ $parameter["group_forum_categories_query"].pageToken }}',
							filter: '={{ $parameter["group_forum_categories_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Group Forum Comments',
				value: 'list_forum_comments',
				description: "List comments on a group's forum post",
				action: 'List group forum comments',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/forum-categories/{{ $parameter["forumCategoryId"] }}/posts/{{ $parameter["postId"] }}/comments',
						qs: {
							maxPageSize:
								'={{ $parameter["group_forum_comments_query"].maxPageSize }}',
							pageToken: '={{ $parameter["group_forum_comments_query"].pageToken }}',
							filter: '={{ $parameter["group_forum_comments_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Group Forum Posts',
				value: 'list_forum_posts',
				description: "List posts in a group's forum category",
				action: 'List group forum posts',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/forum-categories/{{ $parameter["forumCategoryId"] }}/posts',
						qs: {
							maxPageSize: '={{ $parameter["group_forum_posts_query"].maxPageSize }}',
							pageToken: '={{ $parameter["group_forum_posts_query"].pageToken }}',
							filter: '={{ $parameter["group_forum_posts_query"].filter }}',
							view: '={{ $parameter["group_forum_posts_query"].view }}',
						},
					},
				},
			},
			{
				name: 'List Group Join Requests',
				value: 'get_join_requests',
				description: "Retrieve a group's join requests",
				action: 'List group join requests',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/join-requests',
						qs: {
							maxPageSize: '={{ $parameter["group_join_requests_query"].maxPageSize }}',
							pageToken: '={{ $parameter["group_join_requests_query"].pageToken }}',
							filter: '={{ $parameter["group_join_requests_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Group Memberships',
				value: 'get_memberships',
				description: "Retrieve a group's memberships",
				action: 'List group memberships',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/memberships',
						qs: {
							maxPageSize: '={{ $parameter["arguments_memberships"].maxPageSize }}',
							pageToken: '={{ $parameter["arguments_memberships"].pageToken }}',
							filter: '={{ $parameter["arguments_memberships"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Group Roles',
				value: 'get_roles',
				description: 'Retrieve group roles',
				action: 'List group roles',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/roles',
						qs: {
							maxPageSize: '={{ $parameter["group_roles_query"].maxPageSize }}',
							pageToken: '={{ $parameter["group_roles_query"].pageToken }}',
						},
					},
				},
			},
			{
				name: 'Unassign Member Role',
				value: 'unassign_member_role',
				description: 'Unassign a role from a group member',
				action: 'Unassign group member role',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/memberships/{{ $parameter["membershipId"] }}:unassignRole',
						body: {
							role: '=groups/{{ $parameter["groupId"] }}/roles/{{ $parameter["roleId"] }}',
						},
					},
				},
			},
			{
				name: 'Update Group Description',
				value: 'update_description',
				description: "Update a group's description",
				action: 'Update group description',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/legacy-groups/v1/groups/{{ $parameter["groupId"] }}/description',
						body: {
							description: '={{ $parameter["description"] }}',
						},
					},
				},
			},
			{
				name: 'Update Group Membership',
				value: 'update_member_role',
				description: "Update a member's highest role in the group",
				action: 'Update group membership',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/memberships/{{ $parameter["membershipId"] }}',
						body: {
							role: '=groups/{{ $parameter["groupId"] }}/roles/{{ $parameter["roleId"] }}',
						},
					},
				},
			},
			{
				name: 'Update Group Notification Preference',
				value: 'update_notification_preference',
				description: "Update the authenticated user's group notification preference",
				action: 'Update group notification preference',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/legacy-groups/v1/groups/{{ $parameter["groupId"] }}/notification-preference',
						body: {
							notificationsEnabled:
								'={{ $parameter["group_notification_preference"].notificationsEnabled }}',
							type: '={{ $parameter["group_notification_preference"].type }}',
						},
					},
				},
			},
			{
				name: 'Update Group Settings',
				value: 'update_settings',
				description: "Update a group's settings",
				action: 'Update group settings',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/legacy-groups/v1/groups/{{ $parameter["groupId"] }}/settings',
						body: {
							isApprovalRequired:
								'={{ $parameter["group_settings_update"].isApprovalRequired }}',
							areEnemiesAllowed:
								'={{ $parameter["group_settings_update"].areEnemiesAllowed }}',
							areGroupFundsVisible:
								'={{ $parameter["group_settings_update"].areGroupFundsVisible }}',
							areGroupGamesVisible:
								'={{ $parameter["group_settings_update"].areGroupGamesVisible }}',
							verificationLevel:
								'={{ $parameter["group_settings_update"].verificationLevel }}',
							accountTenureRequirement:
								'={{ $parameter["group_settings_update"].accountTenureRequirement }}',
							slowmode: '={{ $parameter["group_settings_update"].slowmode }}',
							isMemberListVisibleToPublic:
								'={{ $parameter["group_settings_update"].isMemberListVisibleToPublic }}',
						},
					},
				},
			},
		],
		default: 'get_group',
	},
];

export const groupFields: INodeProperties[] = [
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Roblox group ID',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: [
					'accept_join_request',
					'assign_member_role',
					'decline_join_request',
					'get_audit_log',
					'get_group',
					'get_join_requests',
					'get_memberships',
					'get_role',
					'get_roles',
					'get_settings',
					'list_forum_categories',
					'list_forum_comments',
					'list_forum_posts',
					'unassign_member_role',
					'update_description',
					'update_member_role',
					'update_notification_preference',
					'update_settings',
				],
			},
		},
	},
	{
		displayName: 'Join Request ID',
		name: 'joinRequestId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the join request to accept or decline',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['accept_join_request', 'decline_join_request'],
			},
		},
	},
	{
		displayName: 'Membership ID',
		name: 'membershipId',
		type: 'string',
		default: '',
		required: true,
		description: 'The group membership ID',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['assign_member_role', 'unassign_member_role', 'update_member_role'],
			},
		},
	},
	{
		displayName: 'Forum Category ID',
		name: 'forumCategoryId',
		type: 'string',
		default: '',
		required: true,
		description: 'The group forum category ID',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['list_forum_comments', 'list_forum_posts'],
			},
		},
	},
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'string',
		default: '',
		required: true,
		description: 'The group forum post ID',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['list_forum_comments'],
			},
		},
	},
	{
		displayName: 'Role ID',
		name: 'roleId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the role',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['assign_member_role', 'get_role', 'unassign_member_role', 'update_member_role'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		required: true,
		description: 'The group description to set',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['update_description'],
			},
		},
	},
	{
		displayName: 'Group IDs',
		name: 'groupPolicyGroupIds',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated group IDs to request policy info for',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['get_group_policies'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'arguments_memberships',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['get_memberships'],
			},
		},
		options: [
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of results per page',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Token for pagination',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Optional filter expression',
			},
		],
	},
	{
		displayName: 'Join Request Query Parameters',
		name: 'group_join_requests_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['get_join_requests'],
			},
		},
		options: [
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of join requests to return',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Token for pagination',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Optional CEL filter expression, for example user == "users/156"',
			},
		],
	},
	{
		displayName: 'Role Query Parameters',
		name: 'group_roles_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['get_roles'],
			},
		},
		options: [
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of roles to return',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Token for pagination',
			},
		],
	},
	{
		displayName: 'Forum Category Query Parameters',
		name: 'group_forum_categories_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['list_forum_categories'],
			},
		},
		options: [
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of forum categories to return, up to 10',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Token for pagination',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Optional CEL filter expression, for example archived == true',
			},
		],
	},
	{
		displayName: 'Forum Post Query Parameters',
		name: 'group_forum_posts_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['list_forum_posts'],
			},
		},
		options: [
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of forum posts to return, up to 100',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Token for pagination',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Optional CEL filter expression. Only pinned == true is supported.',
			},
			{
				displayName: 'View',
				name: 'view',
				type: 'options',
				default: 'VIEW_UNSPECIFIED',
				description: 'The view in which to retrieve forum posts',
				options: GROUP_FORUM_POST_VIEW_OPTIONS,
			},
		],
	},
	{
		displayName: 'Forum Comment Query Parameters',
		name: 'group_forum_comments_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['list_forum_comments'],
			},
		},
		options: [
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of forum comments to return, up to 100',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Token for pagination',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description:
					'Optional CEL filter expression, for example repliesToCommentId == "01234567-89ab-cdef-0123-456789abcdef"',
			},
		],
	},
	{
		displayName: 'Audit Log Query Parameters',
		name: 'group_audit_log_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['get_audit_log'],
			},
		},
		options: [
			{
				displayName: 'Action Type',
				name: 'actionType',
				type: 'options',
				default: '',
				description: 'Filter for a specific type of action performed',
				options: GROUP_AUDIT_ACTION_TYPE_OPTIONS,
			},
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				description: 'The paging cursor for the previous or next page',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'options',
				default: 50,
				description: 'The number of results per request',
				options: [
					{ name: '10', value: 10 },
					{ name: '25', value: 25 },
					{ name: '50', value: 50 },
					{ name: '100', value: 100 },
				],
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				default: 'Desc',
				description: 'The order the results are sorted in',
				options: [
					{ name: 'Ascending', value: 'Asc' },
					{ name: 'Descending', value: 'Desc' },
				],
			},
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'Filter audit logs for a specific user ID',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'group_settings_update',
		default: {},
		type: 'collection',
		description: 'The group settings to update',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['update_settings'],
			},
		},
		options: [
			{
				displayName: 'Account Tenure Requirement',
				name: 'accountTenureRequirement',
				type: 'options',
				default: '',
				description: 'The account tenure requirement for the group',
				options: levelOptions(5),
			},
			{
				displayName: 'Approval Required',
				name: 'isApprovalRequired',
				type: 'boolean',
				default: false,
				description: 'Whether joining the group requires approval',
			},
			{
				displayName: 'Enemies Allowed',
				name: 'areEnemiesAllowed',
				type: 'boolean',
				default: false,
				description: 'Whether enemy group declarations are allowed',
			},
			{
				displayName: 'Group Funds Visible',
				name: 'areGroupFundsVisible',
				type: 'boolean',
				default: false,
				description: 'Whether group funds are publicly visible',
			},
			{
				displayName: 'Group Games Visible',
				name: 'areGroupGamesVisible',
				type: 'boolean',
				default: false,
				description: 'Whether group games are publicly visible',
			},
			{
				displayName: 'Member List Visible To Public',
				name: 'isMemberListVisibleToPublic',
				type: 'boolean',
				default: false,
				description: 'Whether the group member list is visible to the public',
			},
			{
				displayName: 'Slowmode',
				name: 'slowmode',
				type: 'options',
				default: '',
				description: 'The slowmode level for the group',
				options: levelOptions(3),
			},
			{
				displayName: 'Verification Level',
				name: 'verificationLevel',
				type: 'options',
				default: '',
				description: 'The verification level for the group',
				options: levelOptions(3),
			},
		],
	},
	{
		displayName: 'Notification Preference',
		name: 'group_notification_preference',
		default: {},
		type: 'collection',
		description: 'The group notification preference to update',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['update_notification_preference'],
			},
		},
		options: [
			{
				displayName: 'Notifications Enabled',
				name: 'notificationsEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether to receive notifications from the group',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: 0,
				description: 'The group notification type',
				options: GROUP_NOTIFICATION_TYPE_OPTIONS,
			},
		],
	},
];
