export interface ReqAuthData {
	userId: number;
	userName: string;
	isSuperAdmin?: boolean;
	adminOfApps?: string[];
	appsDbQuery?: any;
}
