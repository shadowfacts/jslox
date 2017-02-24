class Callable {

	constructor(requiredArguments, func) {
		this.requiredArguments = requiredArguments;
		this.func = func;
	}

	getRequiredArguments() {
		return this.requiredArguments;
	}

	call(interpreter, args) {
		return this.func(interpreter, args);
	}

}

module.exports = Callable;
