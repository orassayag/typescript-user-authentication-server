import { NextFunction, Request, Response } from 'express';
import { dbService } from '../shared/services/db.service';
import { DbCollections } from '../shared/consts/db-collections.consts';
import { RoleUserDoc } from '../shared/models/docs/role-user-doc.model';
import { loge } from '../shared/services/logging/logging.service';
import { AdminRoleId } from '../shared/consts/admin-role-id.consts';
import { AppId } from '../shared/consts/app-id.consts';
import { authService } from '../shared/services/auth.service';
import { sendErrorFromMiddleware } from '../shared/middlewares/base.middleware';

export const verifyUserIsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req['authData'] = await authService.getUserDataFromSessionCookie(req);  //  **DEV** { userId: 1, userName: 'or' };
    const authData = req['authData'];
    authData.isSuperAdmin = false;
    authData.adminOfApps = [];
    authData.appsDbQuery = {};

    if (authData.userId !== 0) {
      try {
        const docs: RoleUserDoc[] = await dbService.readMany(DbCollections.RolesUsers, { userId: authData.userId, isActive: true });
        if (docs) {
          const appAdminRoles: string[] = [AdminRoleId.SuperAdmin, AdminRoleId.OemAdmin, AdminRoleId.AppAdmin];
          for (let i = 0, len = docs.length; i < len; i++) {
            const doc = docs[i];
            if (doc.appId === AppId.UserMgmt && (doc.roleId === AdminRoleId.SuperAdmin || doc.roleId === AdminRoleId.OemAdmin)) authData.isSuperAdmin = true;
            if (appAdminRoles.includes(doc.roleId)) authData.adminOfApps.push(doc.appId);
          }
          if (!authData.isSuperAdmin && authData.adminOfApps.length > 0) authData.appsDbQuery = { _id: { $in: authData.adminOfApps } };
        }
      } catch (e) {
        loge('verifyUserIsAdmin error:', e, req);
      }
    }
  } catch (e) {
    loge(req, 'verifyUserIsAdmin error:', e);
  }

  if (req['authData'] && (req['authData'].isSuperAdmin || req['authData'].adminOfApps.length > 0)) {
    next();
  } else {
    sendErrorFromMiddleware(res, 'user is not authorized', 401);
  }
};
