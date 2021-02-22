export interface AppDoc {
	_id: string;
	name: string;
	link: string;
	isActive: boolean;
	cockpitIx?: number;
	adminOf?: string;
	appType: number;
	permissions: {
		[permissionId: string]: {
			name: string;
			[operations: number]: {
				id: string;
				name: string;
			}
		}
	},
	roles: {
		[RoleId: string]: {
			name: string;
			isActive: boolean;
			permissions: {
				[permissionId: string]: {
					[operationId: string]: boolean
				}
			}
		}
	},
	createdById: number,
	createdBy: string,
	createdDate: Date,
	updateById: number,
	updateBy: string,
	updateDate: Date
}
