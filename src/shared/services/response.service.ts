import { ServerResponse } from '../models/server-response.model';

export class ResponseService {
	getDefaultServerResponse(): ServerResponse {
		return {
			data: null,
			metaData: {
				codeId: null,
				codeName: null,
				message: '',
				success: false
			}
		}
	}
}

export const responseService = new ResponseService();