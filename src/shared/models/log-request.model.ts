import { AppId } from '../consts/app-id.consts';

export enum LogSeverity {
	Info = 'Info',
	Warning = 'Warning',
	Error = 'Error'
}

export interface LogRequest {
	createTime: number;
	createTimeF: string;
	appId: string;
	version?: string;
	platform: string;
	severity: string;
	env: string;
	errorMsg: string;
	reqMethod: string,
	reqUrl: string,
	reqBody?: any,
	userId?: any;
	errorEvent?: any;
	errorEventMsg?: any;
	additionalData?: any;
	stackTrace?: any;
	type?: any;
}
