export class register {
	#values = null;
	#loaded = null;
	constructor(values={}) {
		this.#values = values;
		this.#loaded = {};
	}

	set(key, value) {
		if (value instanceof HTMLImageElement&&!value.complete) {
			this.#loaded[key] = false;
			value.onload = () => {
				this.#loaded[key] = true;
			}
		} else {
			this.#loaded[key] = true;
		}
		this.#values[key] = value;
	}

	remove(key) {
		return this.#values.pop(key);
	}

	get(key) {
		if (this.#loaded[key]) {
			return this.#values[key];
		}
		return null;
	}

	clear(key=null) {
		if (key==null) {
			this.#values = {};
		} else {
			for (let k in this.#values) {
				if (k==key) {
					this.#values.pop(k);
				}
			}
		}
	}
}