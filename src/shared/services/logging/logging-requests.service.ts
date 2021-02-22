import { LoggingToFileService } from './logging-to-file.service';
import { serverConfig } from '../../../../config';
import { ConsoleUtils } from '../../utils/console.utils';
import { TimeUtils } from '../../utils/time.utils';
import { ObjUtils } from '../../utils/obj.utils';
import { ServerResponse } from '../../models/server-response.model';

export class LoggingRequestsService extends LoggingToFileService {
  readonly isLogIncoming = ObjUtils.getProp(serverConfig, 'logging.incoming.appenders.console.isActive');
  readonly isLogReqToMemory = ObjUtils.getProp(serverConfig, 'logging.requests.appenders.memory.isActive');
  readonly isLogReqToFile = ObjUtils.getProp(serverConfig, 'logging.requests.appenders.file.isActive');
  incomings = [];
  requests = [];
  incomingCount = 0;
  requestCount = 0;

  constructor(isActive, folder, file) {
    super(isActive, folder, file);
  }

  public log(logRequest: any, type?: string) {
    logRequest.type = type;
    super.log(logRequest);
  }

  logRequest(req, res) {
    if (this.isLogIncoming) {
      ConsoleUtils.timeLog('incoming req:', req.method, req.url);
    }

    if (this.isLogReqToMemory) {
      this.incomingCount++;
      this.incomings.unshift(this.getIncomingItem(req));
      this.incomings.length = Math.min(this.incomings.length, ObjUtils.getProp(serverConfig, 'logging.maxMemoryLogs', 0));
    }

    if (this.isLogReqToMemory || this.isLogReqToFile) {
      const props = ['body', 'query', 'params'];
      const item: any = this.getIncomingItem(req);
      this.requestCount++;
      for (const prop of props) {
        if (req.hasOwnProperty(prop) && Object.keys(req[prop]).length > 0) item[prop] = req[prop];
      }
      if (req.cookies && req.cookies.session) item['cookie:session'] = req.cookies.session;
      if (req.headers && req.headers.authorization) item['header:Authorization'] = req.headers.authorization;
      if (this.isLogReqToMemory) {
        this.requests.unshift({ request: item });
        this.requests.length = Math.min(this.requests.length, ObjUtils.getProp(serverConfig, 'logging.maxMemoryLogs', 0));
      }
      if (this.isLogReqToFile) this.log(item, 'Request');
      if (!['/log/errors', '/log/requests', '/log/incoming', '/favicon.ico', '/ping'].includes(req.url)) {
        res.isLogResponse = true;
      }
    }
  }

  logResponse(serverResponse: ServerResponse) {
    if (this.isLogReqToMemory) this.requests.unshift({ response: serverResponse });
    if (this.isLogReqToFile) this.log(serverResponse, 'Response');
  }

  getFileLine(item) {
    const type = item.type;
    delete item.type;
    return TimeUtils.getCurrUniDateTime() + ' ' + type + ':\n' + JSON.stringify(item, null, 2) + '\n\n';
  }

  getIncomingItem(req) {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return { time: TimeUtils.getCurrUniDateTime(), method: req.method, url: req.url, clientIp };
  }

  getIncoming() {
    return { incomingCount: this.incomingCount, incoming: this.incomings }
  }

  getRequests() {
    return { requestCount: this.requestCount, requests: this.requests };
  }
}
