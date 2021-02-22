import { CookiesResponse } from './cookies-response.model';

export interface ServerResponse {
	data: any;
	cookies?: CookiesResponse;
	metaData: {
		codeId: any;
		codeName: any;
		message: any;
		success: boolean;
	}
}