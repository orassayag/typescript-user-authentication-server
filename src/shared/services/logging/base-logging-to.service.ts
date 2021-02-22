import { serverConfig } from '../../../../config';
import { LogRequest } from '../../models/log-request.model';
import { ObjUtils } from '../../utils/obj.utils';

export interface WriteLogResponse {
  isSuccess: boolean;
  writtenCount: number;
  data?: any;
}

export class BaseLoggingToService {
  protected readonly ERROR_APPENDERS = ObjUtils.getProp(serverConfig, 'logging.errors.appenders');
  protected logRequests: LogRequest[] = [];
  protected isDuringSend = false;
  protected tryCount = 0;

  public log(logRequest: any) {
    this.logRequests.push(logRequest);
    if (!this.isDuringSend) {
      this.isDuringSend = true;
      setTimeout(() => this.writeDeferredLog());
    }
  }

  // this function will be overridden for write to file, write to database. etc.
  protected async writeLogs(data?): Promise<WriteLogResponse> {
    const response: WriteLogResponse = this.getDefaultWriteLogResponse();
    return Promise.resolve(response);
  }

  private async writeDeferredLog() {
    try {
      const response: WriteLogResponse = await this.writeLogs();
      if (response.isSuccess) {
        this.tryCount = 0;
        this.logRequests.splice(0, response.writtenCount);
        if (this.logRequests.length > 0) {
          setTimeout(() => this.writeDeferredLog());
        } else {
          this.isDuringSend = false;
        }
      } else {
        await this.retrySend();
      }
    } catch (e) {
      await this.retrySend();
    }
  }

  private async retrySend() {
    if (this.tryCount++ >= this.ERROR_APPENDERS.server.maxSendRetries) {
      this.isDuringSend = false;
    } else {
      setTimeout(() => this.writeDeferredLog(), this.ERROR_APPENDERS.server.sendRetryInterval);
    }
  }

  protected getDefaultWriteLogResponse(isSuccess = false): WriteLogResponse {
    return { isSuccess, writtenCount: 0 };
  }
}
