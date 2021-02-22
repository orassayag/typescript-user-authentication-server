import { HttpService } from '../../shared/services/http.service';
import { ServerResponse } from '../../shared/models/server-response.model';
import { AppServerAuthService } from '../services/app-server-auth.service';
import { BaseRoutes } from '../../shared/routes/base.routes';
import { cookieService } from '../../shared/services/cookie.service';
import { VerifyAuth } from '../../shared/models/verify-auth.model';
import { serverConfig } from '../../../config';

export abstract class BaseAppServerRoutes extends BaseRoutes {
  protected constructor(protected authService: AppServerAuthService,
    private httpService: HttpService) {
    super();
  }

  sendToAuthServer(req, res, method, relativeUrl, data?) {
    return new Promise<ServerResponse>(async (resolve, reject) => {
      try {
        const url = this.getAuthServerUrl(relativeUrl);
        const headers = await this.authService.getAuthRequestHeaders(req);
        const response = await this.httpService.send(method, url, data, headers);
        await this.handleResponseCookies(res, response);
        resolve(response);
      } catch (e) {
        reject(e);
      }
    });
  }

  getAuthServerUrl(url) {
    return serverConfig.mongoDB.uaDatabase + '/' + url;
  }

  async handleResponseCookies(res, responseData: ServerResponse) {
    if (responseData && responseData.cookies) {
      await cookieService.sendCookiesResponseToBrowser(res, responseData.cookies);
      delete responseData.cookies;
    }
  }
}
