export interface UserDoc {
	_id: number;
	userName: string,
	firstName: string;
	lastName: string;
	password: {
		hash: string;
		salt: string;
	},
	isActive: boolean,
	createdById: number,
	createdBy: req.body.CreatedBy,
	updateById: null,
	updateBy: null
}