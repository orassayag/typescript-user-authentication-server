import { AccessCookie } from '../models/access-cookie.model';
import { CookieName } from '../consts/cookie.consts';
import { jwtService } from './jwt.service';
import { ReqAuthData } from '../models/req-auth-data.model';

export class AuthService {
	async getUserDataFromSessionCookie(req): Promise<ReqAuthData> {
		let userId = 0;
		let userName = '';
		let cookieStr = req.cookies ? req.cookies[CookieName.Session] : '';
		if (cookieStr) {
			try {
				const cookie: AccessCookie = await jwtService.parseToken(cookieStr);
				userId = Number(cookie.userId);
				userName = cookie.userName;
			} catch (e) {
			}
		}
		return { userId, userName };
	}
}

export const authService = new AuthService();