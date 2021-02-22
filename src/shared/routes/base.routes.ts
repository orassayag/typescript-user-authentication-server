import { Router } from 'express';
import { ServerResponse } from '../models/server-response.model';
import { StringUtils } from '../utils/string.utils';
import { ResponseService, responseService } from '../services/response.service';
import { loge, loggingService } from '../services/logging/logging.service';
import { TimeUtils } from '../utils/time.utils';

export abstract class BaseRoutes {
	public router: Router;
	protected responseService: ResponseService;

	protected constructor() {
		this.router = Router();
		this.responseService = responseService;
	}

	sendSuccess(res, data = {}, cookies?) {
		const serverResponse: ServerResponse = this.responseService.getDefaultServerResponse();
		serverResponse.metaData.success = true;
		serverResponse.data = data;
		this.sendResponse(serverResponse, res, cookies);
	}

	logSendError(req, res, message, cookies?) {
		loge(req, message);
		this.sendError(res, message, cookies);
	}

	sendError(res, message, cookies?) {
		const serverResponse: ServerResponse = this.responseService.getDefaultServerResponse();
		serverResponse.metaData.message = message;
		this.sendResponse(serverResponse, res, cookies);
	}

	sendResponse(serverResponse, res, cookies?) {
		if (cookies) serverResponse.cookies = cookies;
		if (res.isLogResponse) loggingService.logResponse(Object.assign({}, serverResponse)); // object.assign to avoid type=Response prop
		res.send(serverResponse);
	}

	getUpdateValuesObj(keys, obj) {
		const result = {};
		for (const key of keys) {
			if (obj[key] !== undefined) {
				result[key] = obj[key];
			}
		}
		return result;
	}

	reqParams2Obj(req, idField = '') {
		const params = { appId: 'string', roleId: 'string', userId: 'number', permissionId: 'string' };
		const obj = {};
		for (const key in req.params) {
			const type = params[key];
			if (type) {
				obj[key === idField ? '_id' : key] = (type === 'number' ? Number(req.params[key]) : req.params[key]);
			}
		}
		return obj;
	}

	getInitialCapitalProps(obj, numberTypes = []) {
		const result = {};
		for (let key in obj) {
			if (numberTypes.includes(key)) {
				result[key] = Number(obj[key]);
			} else if (typeof obj[key] === 'string') {
				result[key] = StringUtils.GetInitialCapital(obj[key]);
			} else {
				result[key] = obj[key];
			}
		}
		return result;
	}

	addDocMetaData(doc, obj) {
		obj.createdBy = doc.createdBy || '';
		obj.createdById = doc.createdById || 0;
		obj.createdDate = TimeUtils.epochToIso(doc.createdDate);
		obj.updateBy = doc.updateBy || '';
		obj.updateById = doc.updateById || 0;
		obj.updateDate = TimeUtils.epochToIso(doc.updateDate);
	}
}
