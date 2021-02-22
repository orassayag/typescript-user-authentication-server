import { NextFunction, Request, Response, Router } from 'express';
import { BaseRoutes } from '../shared/routes/base.routes';
import { uaServerAuthService, UaServerAuthService } from '../services/ua-server-auth.service';
import { dbService, DbService } from '../shared/services/db.service';
import { encryptionService, EncryptionService } from '../services/encryption.service';
import { PermissionsResponse } from '../models/permissions-response.model';
import { DbCollections } from '../shared/consts/db-collections.consts';
import { loge } from '../shared/services/logging/logging.service';
import { ReqAuthData } from '../shared/models/req-auth-data.model';
import { verifyReqFromServerMiddleware } from '../middlewares/verify-req-from-server.middleware';

export class AuthRoutes extends BaseRoutes {
	constructor(private authService: UaServerAuthService,
		private dbService: DbService,
		private encryptionService: EncryptionService) {
		super();

		this.router.use(verifyReqFromServerMiddleware);

		this.router.get('/permissions/:appId', async (req: Request, res: Response, next: NextFunction) => {
			let permissionsResponse: PermissionsResponse;
			try {
				const userId = (req['authData'] as ReqAuthData).userId;
				let permissionsResponse: PermissionsResponse;
				if (!userId) {
					permissionsResponse = this.authService.getEmptyPermissionsResponse();
				} else {
					permissionsResponse = await this.authService.getPermissionsResponse(req, userId, req.params.appId);
					permissionsResponse.isLoggedIn = true;
				}
				this.sendSuccess(res, permissionsResponse);
			} catch (e) {
				loge(req, `router get app error:`, e);
				this.sendError(res, e.message);
			}
		});

		this.router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
			try {
				const userDoc = await this.dbService.readOne(DbCollections.Users, { userName: req.body.userName, isActive: true });
				if (!userDoc) {
					this.sendError(res, 'no such user name or user is not active');
				} else {
					const isPasswordCorrect = await this.encryptionService.isTokenMatch(req.body.password, userDoc.password);
					if (!isPasswordCorrect) {
						this.sendError(res, 'user/password is incorrect');
					} else {
						const permissionsResponse: PermissionsResponse = await this.authService.getPermissionsResponse(req, userDoc._id, req.body.appId);
						const rolesDocs = await this.dbService.readMany(DbCollections.RolesUsers, { userId: userDoc._id, isActive: true });
						const roles = rolesDocs.map(doc => `${doc.appId}|${doc.roleId}`);
						permissionsResponse.isLoggedIn = true;
						permissionsResponse.user = { userId: userDoc._id, userName: userDoc.userName, firstName: userDoc.firstName, lastName: userDoc.lastName };
						permissionsResponse.roles = roles;
						const cookiesResponse = await this.authService.setAuthCookies(userDoc._id, userDoc.userName);
						this.sendSuccess(res, permissionsResponse, cookiesResponse);
						// this.sendSuccess(res, permissionsResponse);
					}
				}
			} catch (e) {
				this.logSendError(req, res, e.message);
			}
		});

		// TODO: signup
		this.router.get('/signup', async (req: Request, res: Response, next: NextFunction) => {
			this.sendSuccess(res, this.authService.getEmptyPermissionsResponse());
		});

		this.router.get('/logout', async (req: Request, res: Response, next: NextFunction) => {
			const cookiesResponse = this.authService.removeAuthCookies();
			this.sendSuccess(res, this.authService.getEmptyPermissionsResponse(), cookiesResponse);
		});
	}
}

export const authRoutes: AuthRoutes = new AuthRoutes(uaServerAuthService, dbService, encryptionService);
