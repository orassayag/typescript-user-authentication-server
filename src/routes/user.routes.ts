import { NextFunction, Request, Response, Router } from 'express';

import { BaseRoutes } from '../shared/routes/base.routes';
import { DbCollections } from '../shared/consts/db-collections.consts';
import { DbService, dbService } from '../shared/services/db.service';
import { encryptionService } from '../services/encryption.service';
import { AppDoc } from '../shared/models/docs/app-doc.model';
import { loge } from '../shared/services/logging/logging.service';
import { ObjUtils } from '../shared/utils/obj.utils';
import { RoleUserDoc } from '../shared/models/docs/role-user-doc.model';
import { isAdminOf } from '../middlewares/is-admin-of-app.middleware';
import { sanitationService } from '../shared/services/sanitation.service';
import { UserDoc } from '../shared/models/docs/user-doc.model';

export class UserRoutes extends BaseRoutes {
	constructor(private dbService: DbService) {
		super();

		this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
			try {
				const results = await Promise.all<any>([
					this.dbService.readMany(DbCollections.Users),
					this.dbService.readMany(DbCollections.RolesUsers),
					this.dbService.readMany(DbCollections.Apps, req['authData'].appsDbQuery)
				]);
				if (!results[0] || !results[1] || !results[2]) {
					loge(req, 'query returned no results', results[0] || '', results[1] || '', results[2] || '');
					this.sendError(req, res, 'no users were found');
				} else {
					const users = (results[0] as UserDoc[])
						.map(doc => this.getUserResp(doc));
					users.forEach(user => user.appRoles = (results[1] as RoleUserDoc[])
						.filter(doc => doc.userId === user.userId)
						.map(doc => ({ appId: doc.appId, roleId: doc.roleId, isActive: doc.isActive }))
						.map(item => this.getAppRoleNames(item, results[2]))
					);
					const appRoles = [];
					(results[2] as AppDoc[]).forEach(appDoc => {
						const roles = appDoc.roles;
						if (roles) {
							for (const roleId in roles) {
								appRoles.push({ appId: appDoc._id, appName: appDoc.name, roleId, roleName: roles[roleId].name, isActive: roles[roleId].isActive });
							}
						}
					});
					this.sendSuccess(res, { users, appRoles });
				}
			} catch (e) {
				this.logSendError(req, res, e.message);
			}
		});

		this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
			try {
				const userDoc = await this.dbService.readOne(DbCollections.Users, { userName: req.body.userName });
				if (userDoc) {
					this.sendError(res, `user name ${req.body.userName} already exist`);
				} else {
					const fields = [
						{ name: 'name', label: 'first name', value: req.body.firstName },
						{ name: 'name', label: 'last name', value: req.body.lastName },
						{ name: 'userName', value: req.body.userName },
						{ name: 'password', value: req.body.password }];
					const errorMsg = sanitationService.sanitize(fields);
					if (errorMsg) {
						this.sendError(res, errorMsg);
					} else {
						const params: any = {
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							userName: req.body.userName,
							isActive: req.body.isActive
						};
						const password = (req.body.password || '').trim();
						if (password) params.password = encryptionService.getHashedData(req.body.password);
						const response: any = await this.dbService.insertOneAutoIncrement(DbCollections.Users, params);
						this.sendSuccess(res, { userId: response.insertedId });
					}
				}
			} catch (e) {
				this.logSendError(req, res, e.message);
			}
		});

		this.router.post('/:userId/app-roles', isAdminOf('body'), async (req: Request, res: Response, next: NextFunction) => {
			try {
				const docs = req.body.map(item => ({
					appId: item.appId,
					roleId: item.roleId,
					userId: Number(req.params.userId),
					isActive: ObjUtils.getProp(item, 'isActive', true)
				}));
				await this.dbService.insertMany(DbCollections.RolesUsers, docs);
				this.sendSuccess(res, {});
			} catch (e) {
				this.logSendError(req, res, e.message);
			}
		});
		/*
		this.router.post('/:userId/app/:appId/role/:roleId', async (req: Request, res: Response, next: NextFunction) => {
			try {
			  const query: any = { userId: Number(req.params.userId), appId: req.params.appId, roleId: req.params.roleId };
		const doc = await this.dbService.readOne(DbCollections.RolesUsers, query);
				if (doc) {
		  this.sendError(res, `user/app/role ${query.userId}/${query.appId}/${query.roleId}/ already exist`);
				} else {
				  query.isActive = true;
					const response: any = await this.dbService.insertOne(DbCollections.RolesUsers, query);
					this.sendSuccess(res, { id: response.insertedId });
				}
			} catch (e) {
		this.logSendError(req, res, e.message);
			}
		});
		*/
		this.router.put('/:userId', async (req: Request, res: Response, next: NextFunction) => {
			try {
				const fields = [
					{ name: 'name', label: 'first name', value: req.body.firstName },
					{ name: 'name', label: 'last name', value: req.body.lastName },
					{ name: 'userName', value: req.body.userName }];
				if (req.body.password) fields.push({ name: 'password', value: req.body.password });
				const errorMsg = sanitationService.sanitize(fields);
				if (errorMsg) {
					this.sendError(res, errorMsg);
				} else {
					const params = ObjUtils.copyPropsByName(null, req.body, ['firstName', 'lastName', 'userName', 'isActive']);
					if (req.body.password) params.password = encryptionService.getHashedData(req.body.password);
					const response = await this.dbService.updateOne(DbCollections.Users, { _id: Number(req.params.userId) }, params);
					this.sendSuccess(res, response);
				}
			} catch (e) {
				this.logSendError(req, res, e.message);
			}
		});

		this.router.delete('/:userId', async (req: Request, res: Response, next: NextFunction) => {
			try {
				const results = await Promise.all<any>([
					this.dbService.deleteOne(DbCollections.Users, { _id: Number(req.params.userId) }),
					this.dbService.delete(DbCollections.RolesUsers, { userId: Number(req.params.userId) })
				]);
				if (!results[0] || results[0].deletedCount !== 1) {
					this.sendError(res, `User ${req.params.userId} does not exist`);
				} else {
					this.sendSuccess(res);
				}
			} catch (e) {
				this.logSendError(req, res, e.message);
			}
		});

		this.router.delete('/:userId/app/:appId/role/:roleId', isAdminOf('params.appId'), async (req: Request, res: Response, next: NextFunction) => {
			try {
				const query: any = { userId: Number(req.params.userId), appId: req.params.appId, roleId: req.params.roleId };
				await this.dbService.delete(DbCollections.RolesUsers, query);
				this.sendSuccess(res);
			} catch (e) {
				this.logSendError(req, res, e.message);
			}
		});
	}



	getUserResp(doc) {
		return {
			userId: doc._id,
			userName: doc.userName,
			firstName: doc.firstName,
			lastName: doc.lastName,
			isActive: doc.isActive || false,
			appRoles: []
		};
	}

	getAppRoleNames(obj, appDocs: AppDoc[]) {
		const appDoc = appDocs.find(item => item._id === obj.appId);
		if (!appDoc) {
			obj.appName = '';
			obj.roleName = '';
		} else {
			obj.appName = appDoc.name;
			const role = (appDoc.roles ? appDoc.roles[obj.roleId] : undefined)
			obj.roleName = (role ? role.name : '');
		}
		return obj;
	}
}

export const userRoutes: UserRoutes = new UserRoutes(dbService);
