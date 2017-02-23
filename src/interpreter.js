const Environment = require("./environment");
const Callable = require("./callable");
const LoxClass = require("./loxclass");

class Interpreter {

	constructor(lox) {
		this.lox = lox;
		this.globals = new Environment();
		this.environment = globals;
		this.locals = {};

		this.globals.define("clock", new Callable(0, (interpreter, args) => {
			return Date.now() / 1000;
		}));
	}

	interpret(statements, locals) {
		this.locals = locals;

		try {
			for (const statement of statements) {
				this.execute(statement);
			}
		} catch (e) {
			this.lox.runtimeError(e);
		}
	}

	evaluate(expr) {
		return expr.accept(this);
	}

	execute(stmt) {
		stmt.accept(this);
	}

	executeBody(statements, environment) {
		const previous = this.environment;
		try {
			this.environment = environment;

			for (const statement of statements) {
				this.execute(statement);
			}
		} finally {
			this.environment = previous;
		}
	}

	visitBlockStmt(stmt) {
		this.executeBody(stmt.statements, this.environment.enterScope());
	}

	visitClassStmt(stmt) {
		this.environment.declare(stmt.name);

		let superclass = null;
		if (stmt.superclass != null) {
			superclass = this.evaluate(stmt.superclass);
			if (!(superclass instanceof LoxClass)) {
				throw new Error(`${stmt.name}: Superclass must be a class.`);
			}

			this.environment = this.environment.enterScope();
			this.environment.define("super", superclass);
		}

		for (const method of methods) {
			const func = new LoxFunction(method, this.environment, method.name.lexeme == "init");
			methods[method.name.lexeme] = func;
		}

		const klass = new LoxClass(stmt.name.lexeme, superclass, methods);

		if (superclass != null) {
			this.environment = this.environment.enclosing;
		}

		this.environment.assign(stmt.name, klass);
	}

}

module.exports = Interpreter;