const Environment = require("./environment");
const Callable = require("./callable");
const LoxClass = require("./loxclass");
const RuntimeError = require("./runtimeerror");
const LoxFunction = require("./loxfunction");
const Return = require("./return");
const TokenType = require("./tokentype");
const LoxInstance = require("./loxinstance");

class Interpreter {

	constructor(lox) {
		this.lox = lox;
		this.globals = new Environment();
		this.environment = this.globals;
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
				throw new RuntimeError(`${stmt.name}: Superclass must be a class.`);
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

	visitExpressionStmt(stmt) {
		this.evaluate(stmt.expression);
	}

	visitFunctionStmt(stmt) {
		this.environment.declare(stmt.name);

		const func = new LoxFunction(stmt, this.environment, false);
		this.environment.assign(stmt.name, func);
	}

	visitIfStmt(stmt) {
		if (this.isTrue(this.evaluate(stmt.condition))) {
			this.execute(stmt.thenBranch);
		} else if (stmt.elseBranch != null) {
			this.execute(stmt.elseBranch);
		}
	}

	visitPrintStmt(stmt) {
		const value = this.evaluate(stmt.expression);
		console.log(this.stringify(value));
	}

	visitReturnStmt(stmt) {
		let value = null;
		if (stmt.value != null) this.evaluate(stmt.value);

		throw new Return(value);
	}

	visitVarStmt(stmt) {
		let value = null;
		if (stmt.initializer != null) {
			value = this.evaluate(stmt.initializer);
		}

		this.environment.define(stmt.name.lexeme, value);
	}

	visitWhileStmt(stmt) {
		while (this.isTrue(this.evaluate(stmt.condition))) {
			this.execute(stmt.body);
		}
	}

	visitAssignExpr(expr) {
		const value = this.evaluate(expr.value);

		const distance = this.locals[expr];
		if (distance != null) {
			this.environment.assignAt(distance, expr.name, value);
		} else {
			this.globals.assign(expr.name, value);
		}

		return value;
	}

	visitBinaryExpr(expr) {
		const left = this.evaluate(expr.left);
		const right = this.evaluate(expr.right);

		switch (expr.operator.type) {
			case TokenType.BANG_EQUAL: return !this.isEqual(left, right);
			case TokenType.EQUAL_EQUAL: return this.isEqual(left, right);

			case TokenType.GREATER:
				this.checkNumberOperands(expr.operator, left, right);
				return left > right;

			case TokenType.GREATER_EQUAL:
				this.checkNumberOperands(expr.operator, left, right);
				return left >= right;

			case TokenType.LESS:
				this.checkNumberOperands(expr.operator, left, right);
				return left < right;

			case TokenType.LESS_EQUAL:
				this.checkNumberOperands(expr.operator, left, right);
				return left <= right;

			case TokenType.MINUS:
				this.checkNumberOperands(expr.operator, left, right);
				return left - right;

			case TokenType.PLUS:
				if (typeof left == "number" && typeof right == "number") {
					return left + right;
				}
				if (typeof left == "string" && typeof right == "string") {
					return left + right;
				}

				throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");

			case TokenType.SLASH:
				this.checkNumberOperands(expr.operator, left, right);
				return left / right;

			case TokenType.STAR:
				this.checkNumberOperands(expr.operator, left, right);
				return left * right;
		}
	}

	visitCallExpr(expr) {
		const callee = this.evaluate(expr.callee);

		const args = [];
		for (argument of expr.args) {
			args.push(this.evaluate(argument));
		}

		if (!(callee instanceof Callable)) {
			throw new RuntimeError(expr.paren, "Can only call functions and classes.");
		}

		if (args.length < callee.getRequiredArguments()) {
			throw new RuntimeError(expr.paren, "Not enough arguments.");
		}

		return callee.call(this, args);
	}

	visitGetExpr(expr) {
		const object = this.evaluate(expr.object);
		if (object instanceof LoxInstance) {
			return object.getProperty(expr.name);
		}

		throw new RuntimeError(expr.name, "Only instances have properties.");
	}

	visitGroupingExpr(expr) {
		return this.evaluate(expr.expression);
	}

	visitLiteralExpr(expr) {
		return expr.value;
	}

	visitLogicalExpr(expr) {
		const left = this.evaluate(expr.left);
		if (expr.operator.type == TokenType.OR && this.isTrue(left)) {
			return left;
		}
		if (expr.operator.type == TokenType.AND && !this.isTrue(left)) {
			return left;
		}
		return this.evaluate(expr.right);
	}

	visitSetExpr(expr) {
		const value = this.evaluate(expr.value);
		const object = this.evaluate(expr.object);

		if (object instanceof LoxInstance) {
			object.fields[expr.name.lexeme] = value;
			return value;
		}

		throw new RuntimeError(expr.name, "Only instances have fields.");
	}

	visitSuperExpr(expr) {
		const distance = this.locals.get(expr);
		const superclass = this.environment.getAt(distance, "super");

		const receiver = environment.getAt(distance - 1, "this");

		const method = superclass.findMethod(receiver, expr.method.lexeme);
		if (method == null) {
			throw new RuntimeError(expr.method, `Undefined property '${expr.method.lexeme}'.`);
		}

		return method;
	}

	visitThisExpr(expr) {
		return this.lookUpVariable(expr.keyword, expr);
	}

	visitUnaryExpr(expr) {
		const right = this.evaluate(expr.right);

		switch (expr.operator.type) {
			case TokenType.BANG:
				return !this.istrue(right);
			case TokenType.MINUS:
				this.checkNumberOperand(expr.operator, right);
				return -right;
		}
	}

	visitVariableExpr(expr) {
		return this.lookUpVariable(expr.name, expr);
	}

	lookUpVariable(name, expr) {
		const distance = this.locals.get(expr);
		if (distance != null) {
			return this.environment.getAt(distance, name.lexeme);
		} else {
			return this.globals.get(name);
		}
	}

	checkNumberOperands(operator, left, right) {
		if (typeof left == "number" && typeof right == "number") {
			return;
		}

		throw new RuntimeError(operator, "Operands must be numbers.");
	}

	checkNumberOperand(operator, left) {
		if (typeof left == "number") {
			return;
		}

		throw new RuntimeError(operator, "Operand must be a number.");
	}

	print(argument) {
		console.log(this.stringify(argument));
	}

	isTrue(object) {
		if (object == null) return false;
		if (typeof object == "boolean") return object;
		return true;
	}

	isEqual(a, b) {
		if (a == null && b == null) return true;
		if (a == null) return false;
		if (a.equals) {
			return a.equals(b);
		} else {
			return a == b;
		}
	}

	stringify(object) {
		if (object == null) return "nil";

		return object.toString();
	}

}

module.exports = Interpreter;