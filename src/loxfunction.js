const Callable = require("./callable");
const Return = require("./return");

class LoxFunction extends Callable {

	constructor(declaration, closure, isInitializer) {
		super(0, null);
		this.declaration = declaration;
		this.closure = closure;
		this.isInitializer = isInitializer;
	}

	bind(self) {
		const environment = this.closure.enterScope();
		environment.define("this", self);
		return new LoxFunction(this.declaration, environment, this.isInitializer);
	}

	toString() {
		return this.declaration.name.lexeme;
	}

	getRequiredArguments() {
		return this.declaration.parameters.length;
	}

	call(interpreter, args) {
		let result = null;

		try {
			const environment = this.closure.enterScope();

			for (let i = 0; i < this.declaration.parameters.length; i++) {
				environment.define(this.declaration.parameters[i].lexeme, args[i]);
			}

			interpreter.executeBody(this.declaration.body, environment);
		} catch (e) {
			if (e instanceof Return) {
				result = e.value;
			} else {
				console.error(e);
			}
		}

		return this.isInitializer ? this.closure.getAt(0, "this") : result;
	}

}

module.exports = LoxFunction;
