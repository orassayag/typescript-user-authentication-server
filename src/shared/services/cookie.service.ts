import { CookieResponseItem, CookiesResponse } from '../models/cookies-response.model';
import { CookieAction } from '../consts/cookie.consts';
import { JwtService, jwtService } from './jwt.service';
import { serverConfig } from '../../../config';

export class CookieService {
	constructor(private jwtService: JwtService) { }

	async sendCookiesResponseToBrowser(res, cookiesResponse: CookiesResponse) {
		for (const item of cookiesResponse) {
			await this.sendCookieResponseItemToBrowser(res, item);
		}
	}

	async sendCookieResponseItemToBrowser(res, item: CookieResponseItem) {
		switch (item.action) {
			case CookieAction.Add:
				res.cookie(item.name, item.data, item.options);
				break;
			case CookieAction.JWT:
				const token = await jwtService.getNewToken(item.data, item.options.maxAge, serverConfig.jwt.auth.encryptionKey);
				res.cookie(item.name, token, item.options);
				break;
			case CookieAction.Remove:
				res.clearCookie(item.name);
				break;
		}
	}
}

export const cookieService: CookieService = new CookieService(jwtService);
