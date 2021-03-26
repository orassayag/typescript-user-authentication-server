import { NextFunction, Request, Response } from 'express';

import { serverConfig } from '../../config';
import { jwtService } from '../shared/services/jwt.service';
import { loge } from '../shared/services/logging/logging.service';
import { authService } from '../shared/services/auth.service';
import { ReqAuthData } from '../shared/models/req-auth-data.model';
import { sendErrorFromMiddleware } from '../shared/middlewares/base.middleware';

export const verifyReqFromServerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let isAuth = false;
  (req['authData'] as ReqAuthData) = { userId: 0, userName: '' };
  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      await jwtService.parseToken(req.headers.authorization.substr(7), serverConfig.jwt.auth.encryptionKey);
      (req['authData'] as ReqAuthData) = await authService.getUserDataFromSessionCookie(req);
      isAuth = true;
    } catch (e) {
      loge(req, 'verifyAuthUaReqMiddleware error:', e);
    }
  }

  if (isAuth) {
    next();
  } else {
    sendErrorFromMiddleware(res, 'request is not authorized');
  }
};