const RuntimeError = require("./runtimeerror");

class LoxInstance {

	constructor(klass) {
		this.klass = klass;
		this.fields = {};
	}

	getProperty(name) {
		if (this.fields.hasOwnProperty(name.lexeme)) {
			return fields[name.lexeme];
		}

		const method = klass.findMethod(this, name.lexeme);
		if (method != null) return method;

		throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
	}

	toString() {
		return this.klass.name + " instance";
	}

}

module.exports = LoxInstance;
