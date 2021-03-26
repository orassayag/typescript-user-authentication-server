import { BaseLoggingToService, WriteLogResponse } from './base-logging-to.service';
import { serverConfig } from '../../../../config';
import { dbService } from '../db.service';
import { InsertWriteOpResult } from 'mongodb';
import { ObjUtils } from '../../utils/obj.utils';

export class LoggingToDbService extends BaseLoggingToService {
  collName = 'ServerErrorLog_' + serverConfig.appId;
  dbName = '';

  constructor() {
    super();
    if (ObjUtils.getProp(serverConfig, 'logging.errors.appenders.db')) {
      this.dbName = ObjUtils.getProp(serverConfig, 'logging.errors.appenders.db.dbName');
    }
  }

  protected async writeLogs(): Promise<WriteLogResponse> {
    return new Promise<WriteLogResponse>(async (resolve, reject) => {
      const writeLogResponse = this.getDefaultWriteLogResponse();
      if (!dbService || !this.dbName) {
        reject(writeLogResponse);
      } else {
        try {
          const result: InsertWriteOpResult = await dbService.insertMany(this.collName, this.logRequests, { dbName: this.dbName });
          if (!result || !result.result || !result.result.ok) {
            console.error(`log documents were not written to db, collection: ${this.collName}, data: ${JSON.stringify(this.logRequests, null, 2)}`);
          } else {
            writeLogResponse.writtenCount = result.insertedCount;
            writeLogResponse.isSuccess = true;
          }
        } catch (e) {
          console.error(`Error writing log request to DB, collection: ${this.collName}, data: ${JSON.stringify(this.logRequests, null, 2)}, error:`, e);
        }
      }

      if (writeLogResponse.isSuccess) {
        resolve(writeLogResponse);
      } else {
        reject(writeLogResponse);
      }
    });
  }
}