export class ObjUtils {
	static getProp(obj: any, prop: string, defaultValue: any = undefined) {
		let value: any;
		if (!obj) {
			value = defaultValue;
		} else {
			const tokens = prop.split('.');
			if (tokens.length <= 1) {
				value = obj[prop];
			} else {
				value = obj[tokens[0]];
				for (let i = 1, len = tokens.length; i < len && value !== undefined; i++) {
					value = value[tokens[i]];
				}
			}
			if (value === undefined) value = defaultValue;
		}
		return value;
	}

	static hasProps(obj) {
		return obj && Object.keys(obj).length > 0;
	}

	static isArray(obj: any) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}

	static getKeys(obj) {
		if (obj.keys) {
			return obj.keys();
		} else {
			const keys = [];
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) keys.push(key);
			}
			return keys;
		}
	}

	static areEqual(obj1, obj2) {
		const keys1 = ObjUtils.getKeys(obj1);
		const keys2 = ObjUtils.getKeys(obj2);

		if (keys1.length !== keys2.length) return false;
		return keys1.find(key => obj1[key] !== obj2[key]) === undefined;
	}

	static getClone(obj) {
		return Object.assign({}, obj);
	}

	static complementProps(destObj, srcObj) {
		for (const key in srcObj) {
			if (!destObj.hasOwnProperty(key)) destObj[key] = srcObj[key];
		}
		return destObj;
	}

	static deepComplementProps(destObj, srcObj) {
		for (const key in srcObj) {
			if (srcObj.hasOwnProperty(key)) {
				if (typeof srcObj[key] !== 'object') {
					destObj[key] = srcObj[key];
				} else if (Array.isArray(destObj[key])) {
					destObj[key] = srcObj[key];
				} else { // object
					if (!destObj.hasOwnProperty(key)) destObj[key] = {};
					ObjUtils.deepComplementProps(destObj[key], srcObj[key]);
				}
			}
		}
		return destObj;
	}

	static copyProps(destObj, srcObj) {
		for (const key in srcObj) {
			destObj[key] = srcObj[key];
		}
	}

	static copyPropsByName(destObj, srcObj, props) {
		if (!destObj) destObj = {};
		for (let i = 0; i < props.length; i++) {
			const prop = props[i];
			if (typeof prop === 'object') {
				destObj[Object.values(prop)[0] as string] = srcObj[Object.keys(prop)[0]];
			} else {
				destObj[prop] = srcObj[prop];
			}
		}
		return destObj;
	}

	static overrideExistingProps(destObj, srcObj) {
		for (const prop in destObj) {
			if (srcObj.hasOwnProperty(prop)) {
				destObj[prop] = srcObj[prop];
			}
		}
		return destObj;
	}

	static resetObj(obj) {
		for (const prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				const propType = typeof obj[prop];
				obj[prop] = (propType === 'number' ? 0 : propType === 'string' ? '' : Array.isArray(obj[prop]) ? [] : {});
			}
		}
	}

}
