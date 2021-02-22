import { AppDoc } from '../shared/models/docs/app-doc.model';
import { DbCollections } from '../shared/consts/db-collections.consts';
import { dbService, DbService } from '../shared/services/db.service';
import { PermissionsResponse } from '../models/permissions-response.model';
import { CookiesResponse } from '../shared/models/cookies-response.model';
import { serverConfig } from '../../config';
import { CookieAction, CookieName } from '../shared/consts/cookie.consts';
import { AuthService } from '../shared/services/auth.service';
import { UserDoc } from '../shared/models/docs/user-doc.model';
import { loge, logw } from '../shared/services/logging/logging.service';

export class UaServerAuthService extends AuthService {
	private readonly AUTH_COOKIE_OPTIONS = {
		httpOnly: true, // The cookie only accessible by the web server
		// sameSite: (serverConfig.isProdEnv ? 'strict' : 'lax'),
		sameSite: (serverConfig.isProdEnv ? 'strict' : undefined),
		signed: false // Indicates if the cookie should be signed
	};

	constructor(private dbService: DbService) {
		super();
	}

	async setAuthCookies(userId, userName) {
		let roles = [];
		try {
			const rolesDocs = await this.dbService.readMany(DbCollections.RolesUsers, { userId, isActive: true });
			roles = rolesDocs.map(doc => `${doc.appId}|${doc.roleId}`);
		} catch (e) {
			roles = [];
		}
		const data = { userId, userName, roles };
		// const authCookieData = JSON.stringify(data);

		return [
			{  // session cookie
				action: CookieAction.JWT,
				name: CookieName.Session,
				data: data,
				options: Object.assign({}, this.AUTH_COOKIE_OPTIONS, { maxAge: serverConfig.cookies.refresh.maxAge })
			}
			/*
			{  // access cookie
				action: CookieAction.Add,
				name: CookieName.Access,
				data: authCookieData,
				options: Object.assign({}, this.AUTH_COOKIE_OPTIONS, { maxAge: serverConfig.cookies.access.maxAge })
			},
			{  // refresh cookie
				action: CookieAction.Add,
				name: CookieName.Refresh,
				data: authCookieData,
				options: Object.assign({}, this.AUTH_COOKIE_OPTIONS, { maxAge: serverConfig.cookies.refresh.maxAge })
			},
			{  // user data cookie - the cookie user can access
				action: CookieAction.Add,
				name: CookieName.UserData,
				data: JSON.stringify({ firstName, lastName }),
				options: Object.assign({}, this.AUTH_COOKIE_OPTIONS, { httpOnly: false, maxAge: serverConfig.cookies.refresh.maxAge })
			}
			*/
		];
	}

	removeAuthCookies(): CookiesResponse {
		return [
			{  // access cookie
				action: CookieAction.Remove,
				name: CookieName.Session
			},
			/*
			{  // access cookie
				action: CookieAction.Remove,
				name: CookieName.Access
			},
			{  // refresh cookie
				action: CookieAction.Remove,
				name: CookieName.Refresh
			},
			{  // user data cookie - the cookie user can access
				action: CookieAction.Remove,
				name: CookieName.UserData
			}
			*/
		];
	}

	async getPermissionsResponse(req, userId, appId) {
		return new Promise<PermissionsResponse>(async (resolve, reject) => {
			try {
				const results = await Promise.all<any>([
					this.dbService.readMany(DbCollections.RolesUsers, { appId, userId, isActive: true }),
					this.dbService.readOne(DbCollections.Apps, { _id: appId, isActive: true }),
					this.dbService.readOne(DbCollections.Users, { _id: userId })
				]);
				if (!results[0] || !results[1] || results[1].length === 0) {
					logw(`app is not active or is not permitted for user`, results);
					reject(new Error(`invalid app id: ${appId}`));
				} else {
					const roleIds = results[0].map(doc => doc.roleId);


					/*  permission are currently not active
					const appDoc: AppDoc = results[1];
					const docRoles = appDoc.roles;
					const permissions: any = {};

					// combine permissions/operations for all user roles
					for (const roleId of roleIds) {
						const rolePermissions = docRoles[roleId].permissions;
						if (rolePermissions) {
							for (const permissionId in rolePermissions) {
								const rolePermission = rolePermissions[permissionId];
								if (!permissions.hasOwnProperty(permissionId)) permissions[permissionId] = { operations: [] };
								for (const operationId in rolePermission) {
									if (!permissions[permissionId].operations.find(operation => operation.id === operationId)) {
										permissions[permissionId].operations.push({ id: operationId });
									}
								}
							}
						}
					}

					// add names for permissions/operations
					for (const permissionId in permissions) {
						const appPermission: any = appDoc.permissions[permissionId];
						if (appPermission) {
							const permission = permissions[permissionId];
							permission.name = appPermission.name;
							for (const operation of permission.operations) {
								operation.name = appPermission.operations.find(item => item.id === operation.id).name;
							}
						}
					}
					*/
					const permissionsResponse: PermissionsResponse = this.getEmptyPermissionsResponse();
					const userDoc: UserDoc = results[2];
					permissionsResponse.user.userId = String(userDoc._id);
					permissionsResponse.user.userName = userDoc.userName;
					permissionsResponse.user.firstName = userDoc.firstName;
					permissionsResponse.user.lastName = userDoc.lastName;

					// permissionsResponse.permissions = permissions;
					permissionsResponse.roles = roleIds;
					resolve(permissionsResponse);
				}
			} catch (e) {
				loge(req, `${this.constructor.name}::getPermissions error. userId/appId: ${userId}/${appId}, error:`, e);
				reject(e);
			}
		});
	}

	getEmptyPermissionsResponse(): PermissionsResponse {
		return {
			isLoggedIn: false,
			user: {
				userId: '0',
				userName: '',
				firstName: '',
				lastName: ''
			},
			roles: []
		}
	}
}

export const uaServerAuthService = new UaServerAuthService(dbService);
