export interface ServerConfig {
  appId: string,
  env: string,
  isProdEnv: boolean,
  port: number,
  mongoDB: ServerConfigMongoDB,
  logging: ServerConfigLogging,
  jwt?: ServerConfigJwt,
  cookies?: ServerConfigCookies
}

export interface ServerConfigMongoDB {
  user: string,
  password: string,
  connectionString: string,
  database: string
}

export interface ServerConfigLogging {
  logsFolder: string,
  maxMemoryLogs: number,
  incoming: {
    appenders: {
      console: { isActive: boolean },
      memory: { isActive: boolean, count: number }
    }
  },
  requests: {
    appenders: {
      memory: { isActive: boolean, count: number },
      file: { isActive: boolean, requestsFile: string }
    },
  },
  errors: {
    appenders: {
      memory: { isActive: boolean, count: number },
      console: { isActive: boolean },
      file: { isActive: boolean, errorFile: string },
      db: { isActive: boolean, dbName: string },
      server?: { isActive: boolean, maxSendRetries: number, sendRetryInterval: number, logServerAddress: string }
    }
  }
}

export interface ServerConfigJwt {
  issuer: string,
  auth: {
    encryptionKey: string,
    expiresIn: number
  }
}

export interface ServerConfigCookies {
  access: {
    maxAge: number
  },
  refresh: {
    maxAge: number
  },
  userData: {
    maxAge: number
  }
}