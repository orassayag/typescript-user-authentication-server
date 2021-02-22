// encrypt/decrypt node.js and c#
// https://gsferreira.com/archive/2015/02/how-to-encrypt-in-nodejs-and-decrypt-in-c-sharp/
const crypto = require('crypto');

export class EncryptionService {
	readonly SALT_SIZE = 16;  // iterations
	readonly SALT_FORMAT = 'hex';
	readonly ALGORITHM = 'sha512';
	// verify;

	constructor() {
		// this.verify = crypto.createVerify(this.ALGORITHM);
		// console.log('this.verify:', typeof this.verify, this.verify);

		// const token = 'qabc';
		// const hashedData = this.getHashedData(token);

		// 		const cipher = crypto.createCipher(this.ALGORITHM, '123456');
		// console.log('cipher:', typeof cipher, cipher);
		// 		const encrypted = cipher.update(token, 'utf8', 'base64') + cipher.final('base64');
		// console.log('encrypted:', typeof encrypted, encrypted);
	}

	public test1() {
		// crypto.ver
	}

	public getHashedData(token) {
		const salt = this.getNewSalt(this.SALT_SIZE);
		const hash = this.getHashedToken(token, salt);
		return { hash, salt };
	}

	public isTokenMatch(token, hashedData) {
		const password = this.getHashedToken(token, hashedData.salt);
		return password === hashedData.hash;
	}

	private getHashedToken(token, salt) {
		const hmac = crypto.createHmac(this.ALGORITHM, salt);
		hmac.update(token);
		return hmac.digest(this.SALT_FORMAT);
	}

	private getNewSalt(length) {
		return crypto.randomBytes(Math.ceil(length / 2))
			.toString(this.SALT_FORMAT) /** convert to hexadecimal format */
			.slice(0, length);   /** return required number of characters */
	}
}

export const encryptionService: EncryptionService = new EncryptionService();
