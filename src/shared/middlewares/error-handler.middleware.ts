import { CookieName } from '../../shared/consts/cookie.consts';
import { responseService } from '../services/response.service';

// This should be the last middleware after all routes.
export const errorHandlerMiddleware = (err, req, res, next) => {
	console.error('errorHandlerMiddleware - an error has occurred:', err);
	const serverResponse = responseService.getDefaultServerResponse();
	serverResponse.metaData.message = 'A server error happened, please refresh your browser';
	res.status(500).send(serverResponse);
};