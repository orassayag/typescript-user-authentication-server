import { BaseLoggingToService, WriteLogResponse } from './base-logging-to.service';
import { HttpService, httpService } from '../http.service';
import { serverConfig } from '../../../../config';
import { ServerResponse } from '../../models/server-response.model';
import { ObjUtils } from '../../utils/obj.utils';

export class LoggingToServerService extends BaseLoggingToService {
  logServerEndPoint;

  constructor() {
    super();
    const logServerAddress = ObjUtils.getProp(this.ERROR_APPENDERS, 'server.logServerAddress');
    if (logServerAddress) this.logServerEndPoint = logServerAddress + '/api/log';
  }

  protected async writeLogs(log): Promise<WriteLogResponse> {
    return new Promise<WriteLogResponse>(async (resolve, reject) => {
      const writeLogResponse = this.getDefaultWriteLogResponse();
      try {
        const data = { appId: serverConfig.appId, logs: this.logRequests };
        const logRequestsCount = this.logRequests.length;
        const response: ServerResponse = await httpService.send('post', this.logServerEndPoint, data);
        if (response && response.metaData && response.metaData.success) {
          writeLogResponse.writtenCount = logRequestsCount;
          writeLogResponse.isSuccess = true;
          resolve(writeLogResponse);
        } else {
          reject(writeLogResponse);
        }
      } catch (e) {
        reject(writeLogResponse);
      }
    });
  }
}