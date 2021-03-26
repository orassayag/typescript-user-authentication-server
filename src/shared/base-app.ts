import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// const csurf = require('csurf');
const path = require('path');
const packageJson = require(path.join(process.cwd(), '/package.json'));
import { dbService, DbService } from './services/db.service';
import { responseHeadersMiddleware } from './middlewares/response-headers.middleware';
import { logRequestMiddleware } from './middlewares/log-request.middleware';
import { serverConfig } from '../../config';
import { logRoutes } from './routes/log.routes';
import { address } from "ip";
import { TimeUtils } from './utils/time.utils';
import errorHandler from 'errorhandler';

export class BaseApp {
	protected readonly DAY_IN_MS = 1000 * 60 * 60 * 24;
	public app: express.Application;
	public dbService: DbService = dbService;
	protected startTime = Date.now();

	constructor() {
		this.app = express();
	}

	async init() {
		try {
			this.initConfig();
			await this.initDb();
			this.initRoutes();
		} catch (err) {
			console.error('app init failed, error:', err);
		}
	}

	public initConfig() {
		this.initHeadersSecurity();
		this.app.use(bodyParser.json());  // Use JSON form parser middleware.
		this.app.use(bodyParser.urlencoded({ extended: false /* true*/ }));  // Use query string parser middleware.
		this.app.use(cookieParser()); // "SECRET_GOES_HERE"

		// this.app.use(csurf({ cookie: true }));
		// this.app.use(csrfTokenMiddleware); // Generate csrf cookie in index.html/app.js.
		this.app.use(helmet()); // Security - Set security-related HTTP response headers.

		this.initStaticFiles();
		this.app.use(logRequestMiddleware);
		// this.app.use(csrfErrorHandlerMiddleware);
	}

	initHeadersSecurity() {
		if (!serverConfig.isProdEnv) {
			this.app.use(cors({ credentials: true, origin: true }));
		}

		this.app.disable('x-powered-by'); // Security - Hide the platform in response header.
		this.app.use(responseHeadersMiddleware);
	}

	initStaticFiles() {
		// this.app.get('/', (req, res, next) => {
		// 	console.log('==> req:', req.url, ', cookies:', req.cookies);
		// 	fs.readFile('./dist/cockpit/index.html', 'utf8', (err, response) => {
		// 		res.send(response);
		// 	})
		// });

		this.app.use(express.static('./dist'));
	}

	getDbName() {
		return '';
	}

	async initDb() {
		const dbName = this.getDbName();
		if (dbName !== '') {
			try {
				await this.dbService.init(serverConfig.mongoDB.connectionString, dbName);
			} catch (err) {
				console.error('error calling initDb:', err);
			}
		}
	}

	public initRoutes() {
		this.initDevRoutes();
		this.initGeneralRoutes();
	}

	protected initDevRoutes() {
		if (!serverConfig.isProdEnv) {
			this.app.use(errorHandler());
			this.app.use('/log', logRoutes.router);
			this.app.get('/ping', (req, res) => {
				const diff = Date.now() - this.startTime;
				const hoursInMs = (diff % this.DAY_IN_MS);
				const days = Math.floor(diff / this.DAY_IN_MS);
				const daysMsg = (!days ? '' : days === 1 ? `${days} day and ` : `${days} days and `);
				res.send(`${TimeUtils.getCurrUniDateTime()} :: process ${process.pid} - server ${address()}:${serverConfig.port} version ${packageJson.version} is up for ${daysMsg}${TimeUtils.ms2Time(hoursInMs)} hours`)
			});
			this.app.get('/favicon.ico', (req, res) => {
				res.setHeader('Content-Length', '0');
				res.setHeader('Content-Type', 'image/x-icon');
				res.end();
			});
		}
	}

	protected initGeneralRoutes() {
		this.app.get('/api/version', (req, res) => {
			res.send({ version: packageJson.version });
		});
	}

	async close() {
		await this.dbService.close();
	}
}