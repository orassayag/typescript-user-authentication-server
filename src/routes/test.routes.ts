import { NextFunction, Request, Response } from 'express';
import { BaseRoutes } from '../shared/routes/base.routes';
import { dbService, DbService } from '../shared/services/db.service';
import { loge } from '../shared/services/logging/logging.service';
import { DbCollections } from '../shared/consts/db-collections.consts';
import { ServerResponse } from '../shared/models/server-response.model';

export class TestRoutes extends BaseRoutes {
	constructor(private dbService: DbService) {
		super();

		this.router.get('/read', async (req: Request, res: Response, next: NextFunction) => {
			console.log('getPermissionsResponse, START');
			// loge(req, 'some test error');
			const appId = 'DataCenter';
			const userId = 103;

			const rolesQuery = { appId: appId, userId: userId, isActive: true };
			const appQuery = { _id: appId };
			const results = await Promise.all<any>([
				this.dbService.readMany(DbCollections.RolesUsers, rolesQuery),
				this.dbService.readOne(DbCollections.Apps, appQuery),
				this.dbService.readOne(DbCollections.Users, { _id: userId })
			]);
			console.log('getPermissionsResponse, results:', results);
			/*
						try {
							await this.dbService.readOne('Apps', { appId: 'DataCenter' });
						} catch(e) {
							console.log('read failed:', e);
						}
			*/

			this.sendSuccess(res, { message: 'OK' });
		});

		this.router.get('/read-docker', async (req: Request, res: Response, next: NextFunction) => {
			try {
				const apps = await this.dbService.readMany(DbCollections.Apps);
				this.sendSuccess(res, { apps });
			} catch (e) {
				this.sendError(res, e.message);
			}
		});

		this.router.get('/error/:errorId', async (req: Request, res: Response, next: NextFunction) => {
			this.sendError(res, 'Error Test ' + req.params.errorId);
		});

		this.router.get('/error/status/:errorId', async (req: Request, res: Response, next: NextFunction) => {
			const serverResponse: ServerResponse = this.responseService.getDefaultServerResponse();
			serverResponse.metaData.message = 'Error test with status';
			res.status(Number(req.params.errorId)).send(serverResponse);
			// res.status(Number(req.params.errorId)).send('Error test with status');

		});

		this.router.get('/error2', async (req: Request, res: Response, next: NextFunction) => {
			loge(req, 'some test error');
			this.sendSuccess(res, { message: 'OK' });
		});

		this.router.get('/crash', async (req: Request, res: Response, next: NextFunction) => {
			console.log('crash route START');
			await this.crash();
			console.log('crash route - after call to crash()');
			this.sendSuccess(res, { message: 'OK' });
		});

		this.router.get('/crash2', () => {
			process.nextTick(function () {
				throw new Error;
			});
		})
	}

	crash() {
		return new Promise((resolve, reject) => {
			reject();
		});
	}
}

export const testRoutes: TestRoutes = new TestRoutes(dbService);