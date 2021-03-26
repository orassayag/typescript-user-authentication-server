import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoutes } from '../routes/base.routes';
import { loge, loggingService } from '../services/logging/logging.service';
import { serverConfig } from '../../../config';

export class LogRoutes extends BaseRoutes {
	constructor() {
		super();

		this.router.get('/incoming', async (req: Request, res: Response, next: NextFunction) => {
			res.send(loggingService.getIncoming());
		});

		this.router.get('/requests', async (req: Request, res: Response, next: NextFunction) => {
			res.send(loggingService.getRequests());
		});

		this.router.get('/errors', async (req: Request, res: Response, next: NextFunction) => {
			res.send(loggingService.getErrors());
		});

		this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
			if (!req.body.type) {
				this.sendError(res, 'please specify a type: memory, db, etc.');
			} else {
				try {
					let logs = [];
					const type = req.body.type;
					switch (type) {
						case 'memory':
							logs = loggingService.errorLogs;
							break;
					}

					if (!Array.isArray(logs)) {
						this.logSendError(req, res, 'logs variable is not an array');
					} else {
						this.sendSuccess(res, { logCount: logs.length, logs });
					}
				} catch (e) {
					this.logSendError(req, res, e.message);
				}
			}
		});
	}
}

export const logRoutes: LogRoutes = new LogRoutes();