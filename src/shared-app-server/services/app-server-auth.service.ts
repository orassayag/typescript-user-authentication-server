import { jwtService, JwtService } from '../../shared/services/jwt.service';
import { AuthService } from '../../shared/services/auth.service';
import { serverConfig } from '../../../config';

export class AppServerAuthService extends AuthService {
  private appServerAuthToken;

  constructor(private jwtService: JwtService) {
    super();
  }

  async initToken() {
    this.appServerAuthToken = await this.jwtService.getNewToken({}, serverConfig.jwt.auth.expiresIn, serverConfig.jwt.auth.encryptionKey);
  }

  async getAppServerAuthToken() {
    if (!this.appServerAuthToken) await this.initToken();
    return this.appServerAuthToken;
  }

  async getAuthRequestHeaders(req) {
    const headers: any = { Authorization: `Bearer ${await this.getAppServerAuthToken()}` };
    if (req && req.headers && req.headers.cookie) {
      headers.cookie = req.headers.cookie;
    }
    return headers;
  }
}

export const appServerAuthService = new AppServerAuthService(jwtService);