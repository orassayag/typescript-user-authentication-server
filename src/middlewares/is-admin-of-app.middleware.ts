import { ReqAuthData } from '../shared/models/req-auth-data.model';
import { sendErrorFromMiddleware } from '../shared/middlewares/base.middleware';

export const isAdminOf = (param: string = '') => {
  return isAdminOf[param] || (isAdminOf[param] = (req, res, next) => {
    const reqAuthData = req['authData'] as ReqAuthData;
    if (reqAuthData.isSuperAdmin) {
      next();
    } else {
      let isAuth = false;
      let appId = '';
      if (param === 'body') {
        isAuth = req.body.find(reqApp => !req['authData'].adminOfApps.includes(reqApp.appId)) === undefined;
      } else if (param.startsWith('params') || param.startsWith('body')) {
        appId = param.split('.').reduce((value, token) => value[token], req);
        isAuth = appId != '' && reqAuthData.adminOfApps.includes(appId);
      }
      if (isAuth) {
        next();
      } else {
        sendErrorFromMiddleware(res, 'user is not authorized', 401);
      }
    }
  })
};