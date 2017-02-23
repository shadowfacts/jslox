class Expr {
	constructor() {
		this.isExpr = true;
	}
}

class Assign extends Expr {
	constructor(name, value) {
		super();
		this.name = name;
		this.value = value;
	}

	accept(visitor) {
		return visitor.visitAssignExpr(this);
	}
}
Expr.Assign = Assign;

class Binary extends Expr {
	constructor(left, operator, right) {
		super();
		this.left = left;
		this.operator = operator;
		this.right = right;
	}

	accept(visitor) {
		return visitor.visitBinaryExpr(this);
	}
}
Expr.Binary = Binary;

class Call extends Expr {
	constructor(callee, paren, arguments) {
		super();
		this.callee = callee;
		this.paren = paren;
		this.arguments = arguments;
	}

	accept(visitor) {
		return visitor.visitCallExpr(this);
	}
}
Expr.Call = Call;

class Get extends Expr {
	constructor(object, name) {
		super();
		this.object = object;
		this.name = name;
	}

	accept(visitor) {
		return visitor.visitGetExpr(this);
	}
}
Expr.Get = Get;

class Grouping extends Expr {
	constructor(expression) {
		super();
		this.expression = expression;
	}

	accept(visitor) {
		return visitor.visitGroupingExpr(this);
	}
}
Expr.Grouping = Grouping;

class Literal extends Expr {
	constructor(value) {
		super();
		this.value = value;
	}

	accept(visitor) {
		return visitor.visitLiteralExpr(this);
	}
}
Expr.Literal = Literal;

class Logical extends Expr {
	constructor(left, operator, right) {
		super();
		this.left = left;
		this.operator = operator;
		this.right = right;
	}

	accept(visitor) {
		return visitor.visitLogicalExpr(this);
	}
}
Expr.Logical = Logical;

class Set extends Expr {
	constructor(object, name, value) {
		super();
		this.object = object;
		this.name = name;
		this.value = value;
	}

	accept(visitor) {
		return visitor.visitSetExpr(this);
	}
}
Expr.Set = Set;

class Super extends Expr {
	constructor(keyword, method) {
		super();
		this.keyword = keyword;
		this.method = method;
	}

	accept(visitor) {
		return visitor.visitSuperExpr(this);
	}
}
Expr.Super = Super;

class This extends Expr {
	constructor(keyword) {
		super();
		this.keyword = keyword;
	}

	accept(visitor) {
		return visitor.visitThisExpr(this);
	}
}
Expr.This = This;

class Unary extends Expr {
	constructor(operator, right) {
		super();
		this.operator = operator;
		this.right = right;
	}

	accept(visitor) {
		return visitor.visitUnaryExpr(this);
	}
}
Expr.Unary = Unary;

class Variable extends Expr {
	constructor(name) {
		super();
		this.name = name;
	}

	accept(visitor) {
		return visitor.visitVariableExpr(this);
	}
}
Expr.Variable = Variable;

module.exports = Expr;