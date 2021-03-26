import * as jwt from 'jsonwebtoken';
import { serverConfig } from '../../../config';
import { loge } from './logging/logging.service';

export class JwtService {
	getContent(token, encryptionKey?) {
		return new Promise<any>((resolve, reject) => {
			try {
				jwt.verify(token, encryptionKey || serverConfig.jwt.auth.encryptionKey, (err, decoded) => {
					if (err) {
						reject(err);
					} else {
						resolve(decoded);
					}
				});
			} catch (err) {
				loge('Token verify error:', err);
				reject(err);
			}
		})
	}

	parseToken(token, encryptionKey?) {
		return new Promise<any>((resolve, reject) => {
			try {
				jwt.verify(token, encryptionKey || serverConfig.jwt.auth.encryptionKey, (err, decoded) => {
					if (err) {
						reject(err);
					} else if (decoded.iss !== serverConfig.jwt.issuer) {
						loge('Token validation error - issuer is not valid, token:', decoded, serverConfig.jwt.issuer);
						reject(new Error(`Token validation error - issuer is not valid: ${JSON.stringify(decoded)}/${serverConfig.jwt.issuer}`));
					} else {
						resolve(decoded);
					}
				});
			} catch (err) {
				loge('Token verify error:', err);
				reject(err);
			}
		})
	}

	getNewToken(tokenData, expiresIn, encryptionKey?) {
		return new Promise(async (resolve, reject) => {
			try {
				const claims: any = {}; // expiresIn: expiresIn, issuer: serverConfig.jwt.issuer };
				if (typeof tokenData === 'object' && !Array.isArray(tokenData)) {
					if (!tokenData.hasOwnProperty('exp')) claims.expiresIn = expiresIn;
					if (!tokenData.hasOwnProperty('iss')) claims.issuer = serverConfig.jwt.issuer;
				}

				jwt.sign(tokenData, encryptionKey || serverConfig.jwt.auth.encryptionKey, claims, (err, token) => {
					if (err || !token) {
						loge('JWT sign failed, data:', tokenData, err);
						reject(err);
					} else {
						resolve(token);
					}
				});
			} catch (e) {
				loge('Error signing jwt:', e);
				reject(e);
			}
		})
	}

	isTokenExpired(tokenData) {
		return Date.now() >= tokenData.refreshTime;
	}
}

export const jwtService: JwtService = new JwtService();