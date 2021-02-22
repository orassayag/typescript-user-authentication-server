import { NextFunction, Request, Response, Router } from 'express';

import { AppId } from '../../shared/consts/app-id.consts';
import { ServerResponse } from '../../shared/models/server-response.model';
import { HttpService, httpService } from '../../shared/services/http.service';
import { appServerAuthService, AppServerAuthService } from '../services/app-server-auth.service';
import { BaseAppServerRoutes } from './base-app-server.routes';
import { loge, logi } from '../../shared/services/logging/logging.service';
import { responseService } from '../../shared/services/response.service';

export class BaseAppServerAuthRoutes extends BaseAppServerRoutes {
  constructor(appServerAuthService: AppServerAuthService,
    httpService: HttpService) {
    super(appServerAuthService, httpService);

    this.router.get('/permissions/:appId', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const serverResponse: ServerResponse = await this.sendToAuthServer(req, res, 'get', `auth/permissions/${req.params.appId}`);
        const statusCode = 200; // serverResponse.data.isLoggedIn ? 200 : 401;
        res.status(statusCode).send(serverResponse);
      } catch (e) {
        this.logSendError(req, res, e.message);
      }
    });
  }
}

export const baseAppServerAuthRoutes: BaseAppServerAuthRoutes = new BaseAppServerAuthRoutes(appServerAuthService, httpService);
