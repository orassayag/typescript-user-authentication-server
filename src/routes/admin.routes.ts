import { NextFunction, Request, Response } from 'express';
import { BaseRoutes } from '../shared/routes/base.routes';
import { uaServerAuthService, UaServerAuthService } from '../services/ua-server-auth.service';
import { PermissionsResponse } from '../models/permissions-response.model';
import { loge } from '../shared/services/logging/logging.service';
import { ReqAuthData } from '../shared/models/req-auth-data.model';

export class AdminRoutes extends BaseRoutes {
  constructor(private authService: UaServerAuthService) {
    super();

    this.router.get('/:appId', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req['authData'] as ReqAuthData).userId;
        const permissionsResponse: PermissionsResponse = await this.authService.getPermissionsResponse(req, userId, req.params.appId);
        permissionsResponse.isLoggedIn = true;
        this.sendSuccess(res, permissionsResponse);
      } catch (e) {
        loge(req, `router get admin app error:`, e);
        this.sendError(res, e.message);
      }
    });
  }
}

export const adminRoutes: AdminRoutes = new AdminRoutes(uaServerAuthService);