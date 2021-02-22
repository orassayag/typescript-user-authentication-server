export class StringUtils {
	static getPadded(num: number, count: number, c: string = '0') {
		let str = num.toString();
		for (let i = str.length; i < count; i++) {
			str = c + str;
		}
		return str;
	}

	static GetInitialCapital(str) {
		return str.charAt(0).toUpperCase() + str.substr(1);
	}
}