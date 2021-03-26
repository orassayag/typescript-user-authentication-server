import { NextFunction, Request, Response } from 'express';
import { BaseRoutes } from '../shared/routes/base.routes';
import { uaServerAuthService, UaServerAuthService } from '../services/ua-server-auth.service';
import { dbService, DbService } from '../shared/services/db.service';
import { DbCollections } from '../shared/consts/db-collections.consts';
import { AppDoc } from '../shared/models/docs/app-doc.model';
import { ReqAuthData } from '../shared/models/req-auth-data.model';
import { verifyReqFromServerMiddleware } from '../middlewares/verify-req-from-server.middleware';
import { AppId } from '../shared/consts/app-id.consts';
import { AdminRoleId } from '../shared/consts/admin-role-id.consts';

export class UserRolesRoutes extends BaseRoutes {
	constructor(private authService: UaServerAuthService,
		private dbService: DbService) {
		super();

		this.router.use(verifyReqFromServerMiddleware);

		this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
			try {
				const reqAuthData: ReqAuthData = req['authData'];
				const userRolesDocs = await this.dbService.readMany(DbCollections.RolesUsers, { userId: reqAuthData.userId, isActive: true });
				const appIds = [...new Set(userRolesDocs.map(app => app.appId))]; // Distinct.
				const userRoles = userRolesDocs.map(item => {
					delete item._id;
					delete item.updatedBy;
					return item;
				});

				// If the user is an admin of some app then make sure it can access user management.
				if (!appIds.includes(AppId.UserMgmt) &&
					userRoles.find(item => item.roleId === AdminRoleId.SuperAdmin || item.appId === AppId.UserMgmt ? item.roleId === AdminRoleId.OemAdmin : item.roleId === AdminRoleId.AppAdmin)) {
					appIds.push(AppId.UserMgmt);
				}

				const appDocs: AppDoc[] = await this.dbService.readMany(DbCollections.Apps, { _id: { $in: appIds }, isActive: true }, { sort: { appType: 1, cockpitIx: 1 } });
				const apps = appDocs
					.map(item => {
						item['id'] = item._id;
						delete item._id;
						delete item.permissions;
						delete item.roles;
						return item;
					});

				this.sendSuccess(res, { apps, userRoles });
			} catch (e) {
				this.logSendError(req, res, e.message);
			}
		});
	}
}

export const userRolesRoutes: UserRolesRoutes = new UserRolesRoutes(uaServerAuthService, dbService);