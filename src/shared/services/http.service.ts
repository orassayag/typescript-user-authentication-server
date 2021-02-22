import axios, { AxiosResponse } from 'axios';
import { ServerResponse } from '../models/server-response.model';

export class HttpService {
	send(method, url, data, headers = {}) {
		return new Promise<ServerResponse>(async (resolve, reject) => {
			try {
				const response: AxiosResponse = await axios({ method, url, data, headers });
				if (!response.hasOwnProperty('data') || !response.data.hasOwnProperty('metaData')) {
					reject(new Error(`invalid response from auth server: ${JSON.stringify(response)}`));
				} else {
					resolve(response.data);
				}
			} catch (e) {
				reject(e);
			}
		});
	}
}

export const httpService = new HttpService();
