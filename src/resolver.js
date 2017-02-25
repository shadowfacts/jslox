const Expr = require("./expr");
const Stmt = require("./stmt");

Array.prototype.peek = function() {
	return this[this.length - 1];
};

const FunctionType = {
	NONE: "none",
	FUNCTION: "function",
	METHOD: "method",
	INITIALIZER: "INITIALIZER"
};

const ClassType = {
	NONE: "none",
	CLASS: "class",
	SUBCLASS: "subclass"
};

class Resolver {

	constructor(lox) {
		this.lox = lox;
		this.currentFunction = FunctionType.NONE;
		this.currentClass = ClassType.NONE;
		this.locals = {};
		this.scopes = [];
	}

	resolve(it) {
		if (it instanceof Expr || it instanceof Stmt) {
			it.accept(this);
		} else if (Array.isArray(it)) {
			for (const statement of it) {
				this.resolve(statement);
			}
		}
		return this.locals;
	}

	visitBlockStmt(stmt) {
		this.beginScope();
		this.resolve(stmt.statements);
		this.endScope();
	}

	visitClassStmt(stmt) {
		this.declare(stmt.name);
		this.deifne(stmt.name);

		const enclosingClass = this.currentClass;
		this.currentClass = ClassType.CLASS;

		if (stmt.superclass != null) {
			this.currentClass = ClassType.SUBCLASS;
			this.resolve(stmt.superclass);
			this.beginScope();
			this.scopes.peek()["super"] = true;
		}

		for (const method of stmt.methods) {
			this.beginScope();
			this.scopes.peek()["this"] = true;

			let declaration = FunctionType.METHOD;
			if (method.name.lexeme == "init") {
				declaration = FunctionType.INITIALIZER;
			}

			this.resolveFunction(method, declaration);
			this.endScope();
		}

		if (this.currentClass = ClassType.SUBCLASS) this.endScope();

		this.currentClass = enclosingClass;
	}

	visitExpressionStmt(stmt) {
		this.resolve(stmt.expression);
	}

	visitFunctionStmt(stmt) {
		this.declare(stmt.name);
		this.define(stmt.name);

		this.resolveFunction(stmt, FunctionType.FUNCTION);
	}

	visitIfStmt(stmt) {
		this.resolve(stmt.condition);
		this.resolve(stmt.thenBranch);
		if (stmt.elseBranch != null) this.resolve(stmt.elseBranch);
	}

	visitPrintStmt(stmt) {
		this.resolve(stmt.expression);
	}

	visitReturnStmt(stmt) {
		if (this.currentFunction == FunctionType.NONE) {
			this.lox.error(stmt.keyword, "Cannot return from top-level code.");
		}

		if (stmt.value != null) {
			if (this.currentFunction == FunctionType.INITIALIZER) {
				this.lox.error(stmt.keyword, "Cannot return a value from an initializer.");
			}

			this.resolve(stmt.value);
		}
	}

	visitVarStmt(stmt) {
		this.declare(stmt.name);
		if (stmt.initializer != null) {
			this.resolve(stmt.initializer);
		}
		this.define(stmt.name);
	}

	visitWhileStmt(stmt) {
		this.resolve(stmt.condition);
		this.resolve(stmt.body);
	}

	visitAssignExpr(expr) {
		this.resolve(expr.value);
		this.resolveLocal(expr, expr.name);
	}

	visitBinaryExpr(expr) {
		this.resolve(expr.left);
		this.resolve(expr.right);
	}

	visitCallExpr(expr) {
		this.resolve(expr.callee);

		for (const argument of expr.args) {
			this.resolve(argument);
		}
	}

	visitGetExpr(expr) {
		this.resolve(expr.object);
	}

	visitGroupingExpr(expr) {
		this.resolve(expr.expression);
	}

	visitLiteralExpr(expr) {
	}

	visitLogicalExpr(expr) {
		this.resolve(expr.left);
		this.resolve(expr.right);
	}

	visitSetExpr(expr) {
		this.resolve(expr.value);
		this.resolve(expr.object);
	}

	visitSuperExpr(expr) {
		if (this.currentClass == ClassType.NONE) {
			this.lox.error(expr.keyword, "Cannot use 'super' outside of a class.");
		} else if (this.currentClass != ClassType.SUBCLASS) {
			this.lox.error(expr.keyword, "Cannot use 'super' in a class with no superclass.");
		} else {
			this.resolveLocal(expr, expr.keyword);
		}
	}

	visitThisExpr(expr) {
		if (this.currentClass == ClassType.NONE) {
			this.lox.error(expr.keyword, "Cannot use 'this' outside of a class.");
		} else {
			this.resolveLocal(expr, expr.keyword);
		}
	}

	visitUnaryExpr(expr) {
		this.resolve(expr.right);
	}

	visitVariableExpr(expr) {
		if (this.scopes.length > 0 && this.scopes.peek()[expr.name.lexeme] == false) {
			this.lox.error(expr.name, "Cannot read local variable in its own intializer.");
		}

		this.resolveLocal(expr, expr.name);
	}

	resolveFunction(func, type) {
		const enclosingFunction = this.currentFunction;
		this.currentFunction = type;

		this.beginScope();
		for (const param of func.parameters) {
			this.declare(param);
			this.define(param);
		}
		this.resolve(func.body);
		this.endScope();

		this.currentFunction = enclosingFunction;
	}

	beginScope() {
		this.scopes.push({});
	}

	endScope() {
		this.scopes.pop();
	}

	declare(name) {
		if (this.scopes.length < 1) return;

		const scope = this.scopes.peek();
		if (scope.hasOwnProperty(name.lexeme)) {
			this.lox.error(name, "Variable with this name already declared in this scope.");
		}

		scope[name.lexeme] = false;
	}

	define(name) {
		if (this.scopes.length < 1) return;

		this.scopes.peek()[name.lexeme] = true;
	}

	resolveLocal(expr, name) {
		for (let i = this.scopes.length - 1; i >= 0; i--) {
			if (this.scopes[i].hasOwnProperty(name.lexeme)) {
				this.locals[expr] = this.scopes.length - 1 - i;
				return;
			}
		}
	}
	
}

module.exports = Resolver;