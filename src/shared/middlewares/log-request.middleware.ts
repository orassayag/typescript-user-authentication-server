import { loggingService } from '../services/logging/logging.service';

export const logRequestMiddleware = async (req, res, next) => {
  loggingService.logRequest(req, res);
  next();
};
