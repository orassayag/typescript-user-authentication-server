import { NextFunction, Request, Response } from 'express';
import { BaseRoutes } from '../shared/routes/base.routes';
import { DbCollections } from '../shared/consts/db-collections.consts';
import { DbService, dbService } from '../shared/services/db.service';
import { AppDoc } from '../shared/models/docs/app-doc.model';
import { ObjUtils } from '../shared/utils/obj.utils';
import { isAdminOf } from '../middlewares/is-admin-of-app.middleware';
import { sanitationService } from '../shared/services/sanitation.service';
import { RoleUserDoc } from '../shared/models/docs/role-user-doc.model';

export class AppRoutes extends BaseRoutes {
  constructor(private dbService: DbService) {
    super();

    this.router.get('/', async (req: Request, res: Response) => {
      try {
        const docs: AppDoc[] = await this.dbService.readMany(DbCollections.Apps, req['authData'].appsDbQuery);
        const apps = docs.map(doc => ({ appId: doc._id, appName: doc.name, link: doc.link, isActive: doc.isActive }));
        this.sendSuccess(res, apps);
      } catch (e) {
        this.logSendError(req, res, e.message);
      }
    });

    this.router.get('/:appId', isAdminOf('params.appId'), async (req: Request, res: Response, next: NextFunction) => {
      const USER_PROPS = [{ '_id': 'userId' }, 'firstName', 'lastName', 'userName', 'isActive'];
      try {
        const results = await Promise.all<any>([
          this.dbService.readOne(DbCollections.Apps, { _id: req.params.appId }),
          this.dbService.readMany(DbCollections.RolesUsers, { appId: req.params.appId, userId: { $ne: req['authData'].userId } }),
          this.dbService.readMany(DbCollections.Users, { _id: { $ne: req['authData'].userId } })
        ]);
        if (!results[0]) {
          this.logSendError(req, res, `app ${req.params.appId} was not found`);
        } else {
          const roles = [];
          const appDoc: AppDoc = results[0];
          if (appDoc.hasOwnProperty('roles')) {
            const entries = Object.entries(appDoc.roles);
            for (const [roleId, data] of entries) {
              roles.push({ roleId, roleName: data.name });
            }
          }
          roles.forEach(role => {
            role.users = (results[1] as RoleUserDoc[])
              .filter(item => item.appId === req.params.appId && item.roleId === role.roleId)
              .map(item => results[2].find(userDoc => item.userId === userDoc._id))
              .map(item => ObjUtils.copyPropsByName(null, item, USER_PROPS));
          });
          const app = ObjUtils.copyPropsByName(null, appDoc, [{ '_id': 'appId' }, { 'name': 'appName' }, 'link', 'isActive']);
          app.roles = roles;
          this.sendSuccess(res, { app, users: results[2].map(item => ObjUtils.copyPropsByName(null, item, USER_PROPS)) });
        }
      } catch (e) {
        this.logSendError(req, res, e.message);
      }
    });

    this.router.post('/:appId/roles-users', isAdminOf('params.appId'), async (req: Request, res: Response, next: NextFunction) => {
      try {
        const docs = req.body.map(item => ({
          appId: req.params.appId,
          roleId: item.roleId,
          userId: item.userId,
          isActive: ObjUtils.getProp(item, 'isActive', true)
        }));
        await this.dbService.insertMany(DbCollections.RolesUsers, docs);
        this.sendSuccess(res, {});
      } catch (e) {
        this.logSendError(req, res, e.message);
      }
    });

    this.router.post('/:appId/role/:roleId/user/:userId', isAdminOf('params.appId'), async (req: Request, res: Response) => {
      try {
        const doc = { userId: Number(req.params.userId), appId: req.params.appId, roleId: req.params.roleId, isActive: ObjUtils.getProp(req.body, 'isActive', true) };
        const response: any = await this.dbService.insertOne(DbCollections.RolesUsers, doc);
        this.sendSuccess(res, { id: response.insertedId });
      } catch (e) {
        this.logSendError(req, res, e.message);
      }
    });

    this.router.put('/:appId', isAdminOf('params.appId'), async (req: Request, res: Response, next: NextFunction) => {
      try {
        const fields = [{ name: 'appName', label: 'application name', value: req.body.appName }, { name: 'link', value: req.body.link }];
        const errorMsg = sanitationService.sanitize(fields);
        if (errorMsg) {
          this.sendError(res, errorMsg);
        } else {
          const params = ObjUtils.copyPropsByName(null, req.body, [{ 'appName': 'name' }, 'link', 'isActive']);
          const response = await this.dbService.updateOne(DbCollections.Apps, { _id: req.params.appId }, params);
          this.sendSuccess(res, response);
        }
      } catch (e) {
        this.logSendError(req, res, e.message);
      }
    });

    this.router.delete('/:appId/role/:roleId/user/:userId', isAdminOf('params.appId'), async (req: Request, res: Response) => {
      try {
        const query = { userId: Number(req.params.userId), appId: req.params.appId, roleId: req.params.roleId };
        await this.dbService.deleteOne(DbCollections.RolesUsers, query);
        this.sendSuccess(res, {});
      } catch (e) {
        console.error(`${this.constructor.name} router delete app/${req.params.appId} error:`, e);
        this.logSendError(req, res, e.message);
      }
    });
  }
}

export const appRoutes: AppRoutes = new AppRoutes(dbService);