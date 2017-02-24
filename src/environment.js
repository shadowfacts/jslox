const RuntimeError = require("./runtimeerror");

class Environment {

	constructor(enclosing) {
		if (enclosing) {
			this.enclosing = enclosing;
		} else {
			this.enclosing = null;
		}
		this.values = {};
	}

	declare(name) {
		if (!this.values.hasOwnProperty(name.lexeme)) {
			this.vaues[name.lexeme] = null;
		}
	}

	get(name) {
		if (this.values.hasOwnProperty(name.lexeme)) {
			return this.values[name.lexeme];
		}

		if (this.enclosing != null) return this.enclosing.get(name);

		throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
	}

	assign(name, value) {
		if (this.values.hasOwnProperty(name.lexeme)) {
			this.values[name.lexeme] = value;
			return;
		}

		if (this.enclosing != null) {
			this.enclosing.assign(name, value);
			return;
		}

		throw new RuntimeError(`Undefined variable '${name.lexeme}'.`);
	}

	define(name, value) {
		this.values[name.lexeme] = value;
	}

	getAt(distance, name) {
		let environment = this;
		for (let i = 0; i < distance; i++) {
			environment = environment.enclosing;
		}

		return environment.values[name];
	}

	assignAt(distance, name, value) {
		let environment = this;
		for (let i = 0; i < distance; i++) {
			environment = environment.enclosing;
		}

		environment.values[name.lexeme] = value;
	}

	enterScope() {
		return new Environment(this);
	}

	toString() {
		let result = JSON.stringify(this.values);
		if (this.enclosing != null) {
			result += " -> " this.enclosing.toString();
		}

		return result;
	}

}

module.exports = Environment;
