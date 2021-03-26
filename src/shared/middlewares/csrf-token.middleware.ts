import { CookieName } from '../../shared/consts/cookie.consts';
import { serverConfig } from '../config';

export const csrfTokenMiddleware = (req, res, next) => {
	if (!req.cookies[CookieName.CSRF]) {
		if (req.url === '/' || req.url === '/app.js' && !serverConfig.isProdEnv) {
			res.cookie(CookieName.CSRF, req['csrfToken']());
			res.header('Cache-Control', 'no-store');
		}
	}
	if (req.url === '/app.js') {
		res.header('Content-Type', 'application/javascript');
		res.send();
	} else {
		next();
	}
};