const path = require('path');
const packageJson = require(path.join(process.cwd(), '/package.json'));
import { LogRequestPlatform } from '../../consts/log-request.consts';
import { LogRequest, LogSeverity } from '../../models/log-request.model';
import { ObjUtils } from '../../utils/obj.utils';
import { serverConfig } from '../../../../config';
import { TimeUtils } from '../../utils/time.utils';
import { ConsoleUtils } from '../../utils/console.utils';
import { ServerResponse } from '../../models/server-response.model';
import { LoggingToDbService } from './logging-to-db.service';
import { LoggingToFileService } from './logging-to-file.service';
import { LoggingToServerService } from './logging-to-server.service';
import { LoggingRequestsService } from './logging-requests.service';

export class LoggingService {
	static classNameSep;
	readonly ERROR_APPENDERS = ObjUtils.getProp(serverConfig, 'logging.errors.appenders');
	errorLogs = [];
	errorLogCount = 0;
	loggingToDb: LoggingToDbService;
	loggingToFile: LoggingToFileService;
	loggingToServer: LoggingToServerService;
	loggingRequests: LoggingRequestsService;

	constructor() {
		LoggingService.classNameSep = this.constructor.name + '.';
		this.loggingToDb = new LoggingToDbService();
		this.loggingToServer = new LoggingToServerService();
		this.loggingToFile = new LoggingToFileService(
			ObjUtils.getProp(serverConfig, 'logging.errors.appenders.file.isActive'),
			ObjUtils.getProp(serverConfig, 'logging.logsFolder'),
			ObjUtils.getProp(serverConfig, 'logging.errors.appenders.file.errorFile'));
		this.loggingRequests = new LoggingRequestsService(
			ObjUtils.getProp(serverConfig, 'logging.requests.appenders.file.isActive'),
			ObjUtils.getProp(serverConfig, 'logging.logsFolder'),
			ObjUtils.getProp(serverConfig, 'logging.requests.appenders.file.requestsFile'));
	}

	public async loge(...params) { await this.log(LogSeverity.Error, params); }
	public async logw(...params) { await this.log(LogSeverity.Warning, params); }
	public async logi(...params) { await this.log(LogSeverity.Info, params); }

	private async log(severity, params) {
		try {
			const logRequest = this.getDefaultLogRequest();
			const additionalData = {};
			let additionalDataIx = 0;
			logRequest.severity = severity;
			for (let i = 0; i < params.length; i++) {
				if (params[i] instanceof Error && !logRequest.errorEvent) {
					logRequest.errorEvent = params[i];
					logRequest.errorEventMsg = logRequest.errorEvent.message;
				} else if (this.isRequest(params[i])) {
					const req = params[0];
					logRequest.reqMethod = req.method;
					logRequest.reqUrl = req.originalUrl;
					if (ObjUtils.hasProps(req.body)) logRequest['reqBody'] = Object.assign({}, req.body);
				} else if (typeof params[i] === 'string' && !logRequest.errorMsg) {
					logRequest.errorMsg = params[i];
				} else {
					additionalData[`data${additionalDataIx++}`] = params[i];
				}
			}

			if (additionalDataIx > 0) logRequest.additionalData = additionalData;
			logRequest.stackTrace = LoggingService.getStackTrace();
			await this.sendToAppenders(logRequest);
		} catch (e) {
			ConsoleUtils.timeLog('log service error, severity:', severity, ', params:', JSON.stringify(params, null, 2), ', error:', e);
		}
	}


	/******************************************/
	/*     A P P E N D E R S                  */
	/******************************************/

	async sendToAppenders(logRequest) {
		for (const key in this.ERROR_APPENDERS) {
			const appender = this.ERROR_APPENDERS[key];
			if (appender.isActive) {
				switch (key) {
					case 'memory':
						this.errorLogCount++;
						this.errorLogs.unshift(logRequest);
						this.errorLogs.length = Math.min(this.errorLogs.length, ObjUtils.getProp(serverConfig, 'logging.maxMemoryLogs', 0));
						break;
					case 'console':
						this.print2console(logRequest);
						break;
					case 'file':
						this.loggingToFile.log(logRequest);
						break;
					case 'db':
						this.loggingToDb.log(logRequest);
						break;
					case 'server':
						// loggingDeferredServerService.log(logRequest);
						break;
				}
			}
		}
	}

	print2console(logRequest: LogRequest) {
		const COLORS = {
			[LogSeverity.Error]: "\x1b[31m",
			[LogSeverity.Warning]: "\x1b[35m",
			[LogSeverity.Info]: "\x1b[36m",
			default: "\x1b[37m"  // white
		};

		console.log(COLORS[logRequest.severity], '\n' + TimeUtils.getCurrUniDateTimeMs() + ' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
		console.log(`Create time: ${logRequest.createTimeF}`);
		console.log(`Severity: ${logRequest.errorMsg}`);
		if (logRequest.errorEventMsg) {
			console.log(`Error event message: ${logRequest.errorEventMsg}`);
		}
		if (logRequest.reqMethod) {
			console.log(`Request Method: ${logRequest.reqMethod}`);
			console.log(`Request URL: ${logRequest.reqUrl}`);
			if (logRequest.reqBody) console.log(`Request Body: ${JSON.stringify(logRequest.reqBody, null, 2)}`);
		}

		if (logRequest.additionalData) {
			console.log('Additional data:');
			for (const key in logRequest.additionalData) {
				const value = logRequest.additionalData[key];
				console.log('  ' + (typeof value === 'object' ? `${JSON.stringify(value, null, 2)}` : value));
			}
		}
		console.log(`Stack trace:`);
		logRequest.stackTrace.forEach(line => console.log('  ' + line));
		console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
		console.log(COLORS.default, '')
	}

	public getErrors() {
		return { errorCount: this.errorLogCount, errors: this.errorLogs }
	}

	/****************************/
	/*    R E Q U E S T S       */
	/****************************/

	public logRequest(req, res) {
		this.loggingRequests.logRequest(req, res);
	}

	public logResponse(serverResponse: ServerResponse) {
		this.loggingRequests.logResponse(serverResponse);
	}

	public getIncoming() {
		return this.loggingRequests.getIncoming();
	}

	public getRequests() {
		return this.loggingRequests.getRequests();
	}


	/****************************/
	/*    U T I L S             */
	/****************************/

	static getStackTrace(event = null) {
		let e = event;
		if (!e || !e.stack) e = new Error();
		if (typeof e.stack !== 'string') {
			return e.stack.toString();
		} else {
			return e.stack
				.split('\n')
				.filter(line => !line.startsWith('Error'))
				.filter(line => line.indexOf(LoggingService.classNameSep) === -1)
				.map(line => line.trim());
		}
	}

	private getDefaultLogRequest(): LogRequest {
		return {
			createTime: Date.now(),
			createTimeF: TimeUtils.getCurrUniDateTime(),
			appId: serverConfig.appId,
			version: packageJson.version,
			platform: LogRequestPlatform.Server,
			severity: '',
			env: serverConfig.env,
			errorMsg: '',
			reqMethod: '',
			reqUrl: '',
			stackTrace: ''
		};
	}

	private isRequest(req) {
		let isRequest = false;
		const keys = Object.keys(req);
		if (typeof req === 'object') {
			let keys = [];
			try {
				keys = Object.keys(req);
			} catch (e) {
			}

			if (Array.isArray(keys)) {
				const tokens = ['_readableState', 'connection', 'url', 'method', 'next'];
				const token = tokens.find(item => !keys.includes(item));
				if (!token) isRequest = true;
			}
		}
		return isRequest;
	}
}

export const loggingService = new LoggingService();
export const loge = loggingService.loge.bind(loggingService);
export const logw = loggingService.logw.bind(loggingService);
export const logi = loggingService.logi.bind(loggingService);
