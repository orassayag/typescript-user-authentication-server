import * as path from 'path';
import { BaseLoggingToService, WriteLogResponse } from './base-logging-to.service';
import { serverConfig } from '../../../../config';
import { fileService } from '../file.service';
import { ConsoleUtils } from '../../utils/console.utils';

export class LoggingToFileService extends BaseLoggingToService {
  protected file = '';

  constructor(isActive, folder, file) {
    super();
    if (!isActive || !folder || !file) return;

    try {
      folder = path.join(process.cwd(), folder);
      fileService.verifyFolder(folder).then(async response => {
        file = path.join(folder, file);
        await fileService.verifyFile(file);
        this.file = file;
      }).catch(error => {
        ConsoleUtils.timeLog(this.constructor.name + ': error initializing folder/file:', folder, '/', file, ', error:', error);
      })
    } catch (e) {
      ConsoleUtils.timeLog(this.constructor.name + ': initialization error:', e);
    }
  }

  protected async writeLogs(): Promise<WriteLogResponse> {
    return new Promise<WriteLogResponse>(async (resolve, reject) => {
      const writeLogResponse = this.getDefaultWriteLogResponse();
      if (!this.file) {
        reject(writeLogResponse);
      } else {
        let data = '';
        try {
          const logRequestsCount = this.logRequests.length;
          this.logRequests.forEach(item => data += this.getFileLine(item));
          await fileService.appendFile(this.file, data);
          writeLogResponse.writtenCount = logRequestsCount;
          writeLogResponse.isSuccess = true;
          resolve(writeLogResponse);
        } catch (e) {
          ConsoleUtils.timeLog(`${this.constructor.name}: write to file failed, error:`, e, `, file:`, this.file, `, data:`, data);
          reject(writeLogResponse);
        }
      }
    });
  }

  getFileLine(item, type?) {
    return item.createTimeF + ' ' + JSON.stringify(item, null, 2) + '\n\n';
  }
}
