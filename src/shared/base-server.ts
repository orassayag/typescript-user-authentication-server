import { ConsoleUtils } from './utils/console.utils';
import { ENV_VARS, serverConfig } from '../../config';
import { LoggingService } from './services/logging/logging.service';

const dns = require('dns');
const os = require('os');
const ON_DEATH = require('death')({ SIGHUP: true });

export class BaseServer {
  protected httpServer: any;
  protected app: any;
  protected appContainer: any;
  isProcessExit = false;
  ipAddress = '';

  constructor(private http: any) {
    Error.stackTraceLimit = 20;

    this.getServerIpAddress().then(ipAddress => {
      this.ipAddress = ipAddress;
      ConsoleUtils.timeLog(`======== SERVER ${serverConfig.appId} IS STARTING (${this.ipAddress}:${serverConfig.port}) ==============>`);
      this.printEnvVars();
      const App = require('../app');
      this.appContainer = new App();
      this.app = this.appContainer.app;
      this.appContainer.init().then(res => this.init());
    });
  }

  async init() {
    this.httpServer = this.http.createServer(this.app);
    this.httpServer.listen(serverConfig.port);

    this.httpServer.on('error', (error: any) => {
      if (error.syscall === 'listen') {
        switch (error.code) {
          case 'EACCES':
            console.error('port ' + serverConfig.port + ' requires elevated privileges');
            break;
          case 'EADDRINUSE':
            console.error('port ' + serverConfig.port + ' is already in use');
            break;
        }
      }
      throw (error);
    });

    this.httpServer.on('listening', async () => {
      ConsoleUtils.timeLog(`>>> server is up and ready`);
    });

    process.on('uncaughtException', function (err) {
      ConsoleUtils.timeLog('********************************************************');
      console.log('Uncaught system exception:', err);
      console.log('Stack trace:', LoggingService.getStackTrace(err));
      console.log('******************************************************************************************');
    });

    process.on('unhandledRejection', (reason, promise) => {
      ConsoleUtils.timeLog('********************************************************');
      console.log('Unhandled promise rejection, reason:', reason, ', promise:', promise);
      console.log('Stack trace:', LoggingService.getStackTrace(reason));
      console.log('******************************************************************************************');
    });

    process.on('SIGINT', () => {
      // console.log('SIGINT signal received');
      // Stops the server from accepting new connections and finishes existing connections.
      // this.close();
    });

    process.on('message', (msg) => {
      if (msg == 'shutdown') {
        ConsoleUtils.timeLog('Closing all connections...');
        setTimeout(() => {
          ConsoleUtils.timeLog('Finished closing connections');
          process.exit(0)
        }, 1500)
      }
    });

    ON_DEATH((signal, err) => {
      if (!this.isProcessExit) {
        this.isProcessExit = true;
        this.close();
        // process.exit();
      }
    });
  }

  close() {
    this.httpServer.close(async err => {
      ConsoleUtils.timeLog('The server is closed for incoming requests');
      if (err) {
        console.error(err);
        process.exit(1)
      }
      await this.appContainer.close();
      ConsoleUtils.timeLog(`======== SERVER ${serverConfig.appId} TERMINATED (${this.ipAddress}:${serverConfig.port}) ============`);
      process.exit(0);
    });
  }

  printEnvVars() {
    const unusedEnvVars = [];
    ConsoleUtils.timeLog(`Environment variables:`);
    for (const prop in ENV_VARS) {
      const value = process.env[prop];
      if (value === undefined) {
        unusedEnvVars.push(prop);
      } else {
        const quote = (typeof process.env[prop] === 'string' ? "'" : "");
        ConsoleUtils.timeLog(` * ${prop} = ${quote + process.env[prop] + quote}`);
      }
    }
    for (const prop of unusedEnvVars) {
      const quote = (typeof ENV_VARS[prop] === 'string' ? "'" : "");
      ConsoleUtils.timeLog(`   ${prop} = ${quote + ENV_VARS[prop] + quote}`);
    }
  }

  async getServerIpAddress() {
    let ipAddress = '';
    return new Promise<string>(async (resolve, reject) => {
      try {
        dns.lookup(os.hostname(), (err, response) => {
          if (err) {
            ConsoleUtils.timeLog('error trying to get ip address:', err);
          } else {
            ipAddress = response;
          }
          resolve(ipAddress);
        });
      } catch (e) {
        resolve(ipAddress);
      }
    });
  }
}

