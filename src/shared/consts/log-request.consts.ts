export enum LogRequestAppId {
	Cockpit = 'Cockpit',
	SetupAdmin = 'SetupAdmin',
	SetupUI = 'SetupUI',
	Uploader = 'Uploader'
}

export enum LogRequestPlatform {
	Server = 'Server',
	Client = 'Client'
}

export enum LogRequestSeverity {
	Error = 'Error',
	Warning = 'Warning',
	Info = 'Info'
}

export enum LogRequestEnv {
	Development = 'development',
	QA = 'QA',
	Production = 'production'
}