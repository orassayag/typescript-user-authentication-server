export interface VerifyAuth {
	isLoggedIn: boolean;
	isAppAuth: boolean;
	user: {
		firstName: string;
		lastName: string;
	}
}