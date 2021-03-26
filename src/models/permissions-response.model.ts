export interface PermissionsResponse {
	isLoggedIn: boolean;
	user: {
		userId: string;
		userName: string;
		firstName: string,
		lastName: string
	},
	/*
	permissions: {
		[permissionId: string]: {
			name: string;
			operations: [{
				id: string;
				name: string;
			}]
		}
	},
	*/
	roles: string[]
}