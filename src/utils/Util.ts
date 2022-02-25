function shallowClone<T>(obj: T): T {
	return Object.assign({}, obj);
}

export function deepClone<T>(obj: T): T {
	if (obj === null) return obj;
	if (typeof obj !== 'object') return obj;

	if (obj instanceof Array) {
		const clone = new Array(obj.length);
		obj.forEach((value, id) => {
			clone[id] = deepClone(value);
		});
		return clone as any;
	}

	const clone = shallowClone(obj);
	for (const key in clone) {
		const value = clone[key];
		clone[key] = deepClone(value);
	}
	return clone;
}

export function deepMerge<T>(a: T, b: T): T {
	if (b === undefined) {
		return deepClone(a);
	} else if (a === undefined) {
		return deepClone(b);
	}

	if (typeof a !== typeof b) {
		throw new Error(`failed to deepMerge ${a} and ${b}`);
	}

	if (typeof b !== 'object') return deepClone(b);
	if (b === null) {
		return deepClone(a);
	} else if (a === null) {
		return deepClone(b);
	}

	if (b instanceof Array) {
		if (a instanceof Array) {
			return deepClone(b);
		} else {
			throw new Error(`failed to deepMerge ${a} and ${b}`);
		}
	} else if (a instanceof Array) {
		throw new Error(`failed to deepMerge ${a} and ${b}`);
	}

	const clone = shallowClone(a);
	for (const key in a) {
		clone[key] = deepMerge(a[key], b[key]);
	}
	for (const key in b) {
		clone[key] = deepMerge(a[key], b[key]);
	}
	return clone;
}
