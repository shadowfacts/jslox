const Callable = require("./callable");

class LoxClass extends Callable {

	constructor(name, superclass, methods) {
		super(0, null);
		this.name = name;
		this.superclass = superclass;
		this.methods = methods;
	}

	findMethod(instance, name) {
		let klass = this;
		while (klass != null) {
			if (klass.methods.hasOwnProperty(name)) {
				return klass.methods[name].bind(instance);
			}

			klass = klass.superclass;
		}

		return null;
	}

	toString() {
		return this.name;
	}

	getRequiredArguments() {
		const initializer = methods["init"];
		if (initializer == null) return 0;
		return initializer.getRequiredArguments();
	}

	call(interpreter, args) {
		const instance = new LoxInstance(this);

		const initializer = methods["init"];
		if (initializer != null) {
			initializer.bind(instance).call(interpreter, args);
		}

		return instance;
	}

}

module.exports = LoxClass;
