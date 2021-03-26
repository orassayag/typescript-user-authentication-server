import { CookieAction } from '../consts/cookie.consts';

export interface CookieResponseItem {
	action: CookieAction
	name: string,
	data?: any;
	options?: any;
}

export interface CookiesResponse extends Array<CookieResponseItem> { }