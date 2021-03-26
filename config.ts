import { AppId } from './src/shared/consts/app-id.consts';
import { ObjUtils } from './src/shared/utils/obj.utils';

//=========================================================================
// DEFAULT ENVIRONMENT VARIABLES.
//=========================================================================

export const DEFAULT_ENV_VARS = {
  ENV: 'development',
  PORT: 5111,
  MONGO_CONNSTRING: `mongo_address`,
  MONGO_DATABASE_UA: 'UA_DB_Dev',
  MONGO_DATABASE_LOGS: 'UA_Logs_Dev'
};

//=========================================================================

export const ENV_VARS = ObjUtils.overrideExistingProps({ ...DEFAULT_ENV_VARS }, process.env);
export const isProdEnv = (ENV_VARS.ENV === 'production');

export const serverConfig = {
  appId: AppId.UA,
  env: ENV_VARS.ENV,
  isProdEnv: isProdEnv,
  port: ENV_VARS.PORT,
  mongoDB: {
    connectionString: ENV_VARS.MONGO_CONNSTRING,
    uaDatabase: ENV_VARS.MONGO_DATABASE_UA
  },
  logging: {
    logsFolder: 'logs',
    maxMemoryLogs: 1000,
    incoming: {
      appenders: {
        console: { isActive: true },
        memory: { isActive: !isProdEnv }
      }
    },
    requests: {
      appenders: {
        memory: { isActive: !isProdEnv },
        file: { isActive: !isProdEnv, requestsFile: 'request.log' }
      },
    },
    errors: {
      appenders: {
        memory: { isActive: !isProdEnv },
        console: { isActive: true },
        file: { isActive: true, errorFile: 'error.log' },
        db: { isActive: !isProdEnv, dbName: ENV_VARS.MONGO_DATABASE_LOGS },
        server: { isActive: false, maxSendRetries: 3, sendRetryInterval: 15000, logServerAddress: 'http://localhost:17001' } // interval in ms
      }
    }
  },
  jwt: {
    issuer: 'ua',
    auth: {
      encryptionKey: '1111111111111111',
      expiresIn: 2592000000, // 1 month.
    },
  },
  cookies: {
    access: {
      maxAge: 1000 * 60 * 15, // In milliseconds, 15 minutes.
    },
    refresh: {
      maxAge: 1000 * 60 * 60 * 4, // In milliseconds, 4 hours.
    },
    userData: {
      maxAge: 1000 * 60 * 15, // In milliseconds, expire after 15 minutes.
    },
  },
};