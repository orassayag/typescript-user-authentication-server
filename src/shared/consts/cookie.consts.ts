export enum CookieAction {
	Add = 'add',
	JWT = 'JWT',
	Remove = 'remove'
}

export enum CookieName {
	Session = 'session',
	Access = 'access',
	Refresh = 'refresh',
	UserData = 'userdata',
	CSRF = 'XSRF-TOKEN'
}