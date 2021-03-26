import { serverConfig } from '../../../config';

export const responseHeadersMiddleware = (req, res, next) => {
	if (req.url.startsWith('/json')) {
		res.send();
	} else {
		if (!serverConfig.isProdEnv) {
			res.header('Access-Control-Allow-Credentials', 'true');
			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin, access-control-allow-headers');
		}
		res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE');
		next();
	}
};