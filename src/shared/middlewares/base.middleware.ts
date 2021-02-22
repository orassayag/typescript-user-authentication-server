import { responseService } from '../services/response.service';
import { ServerResponse } from '../models/server-response.model';

export const sendErrorFromMiddleware = (res, message, status = 200) => {
  const serverResponse: ServerResponse = responseService.getDefaultServerResponse();
  serverResponse.data = { isLoggedIn: false };
  serverResponse.metaData.message = message;
  res.status(status).send(serverResponse);
};
