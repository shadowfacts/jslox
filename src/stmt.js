class Stmt {
	constructor() {
	}
}

class Block extends Stmt {
	constructor(statements) {
		super();
		this.statements = statements;
	}

	accept(visitor) {
		return visitor.visitBlockStmt(this);
	}
}
Stmt.Block = Block;

class Class extends Stmt {
	constructor(name, superclass, methods) {
		super();
		this.name = name;
		this.superclass = superclass;
		this.methods = methods;
	}

	accept(visitor) {
		return visitor.visitClassStmt(this);
	}
}
Stmt.Class = Class;

class Expression extends Stmt {
	constructor(expression) {
		super();
		this.expression = expression;
	}

	accept(visitor) {
		return visitor.visitExpressionStmt(this);
	}
}
Stmt.Expression = Expression;

class Function extends Stmt {
	constructor(name, parameters, body) {
		super();
		this.name = name;
		this.parameters = parameters;
		this.body = body;
	}

	accept(visitor) {
		return visitor.visitFunctionStmt(this);
	}
}
Stmt.Function = Function;

class If extends Stmt {
	constructor(condition, thenBranch, elseBranch) {
		super();
		this.condition = condition;
		this.thenBranch = thenBranch;
		this.elseBranch = elseBranch;
	}

	accept(visitor) {
		return visitor.visitIfStmt(this);
	}
}
Stmt.If = If;

class Print extends Stmt {
	constructor(expression) {
		super();
		this.expression = expression;
	}

	accept(visitor) {
		return visitor.visitPrintStmt(this);
	}
}
Stmt.Print = Print;

class Return extends Stmt {
	constructor(keyword, value) {
		super();
		this.keyword = keyword;
		this.value = value;
	}

	accept(visitor) {
		return visitor.visitReturnStmt(this);
	}
}
Stmt.Return = Return;

class Var extends Stmt {
	constructor(name, initializer) {
		super();
		this.name = name;
		this.initializer = initializer;
	}

	accept(visitor) {
		return visitor.visitVarStmt(this);
	}
}
Stmt.Var = Var;

class While extends Stmt {
	constructor(condition, body) {
		super();
		this.condition = condition;
		this.body = body;
	}

	accept(visitor) {
		return visitor.visitWhileStmt(this);
	}
}
Stmt.While = While;

module.exports = Stmt;