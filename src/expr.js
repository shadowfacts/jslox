const Expr = {};

class Assign {
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}

	accept(visitor) {
		return visitor.visitAssignExpr(this);
	}
}
Expr.Assign = Assign;

class Binary {
	constructor(left, operator, right) {
		this.left = left;
		this.operator = operator;
		this.right = right;
	}

	accept(visitor) {
		return visitor.visitBinaryExpr(this);
	}
}
Expr.Binary = Binary;

class Call {
	constructor(callee, paren, arguments) {
		this.callee = callee;
		this.paren = paren;
		this.arguments = arguments;
	}

	accept(visitor) {
		return visitor.visitCallExpr(this);
	}
}
Expr.Call = Call;

class Get {
	constructor(object, name) {
		this.object = object;
		this.name = name;
	}

	accept(visitor) {
		return visitor.visitGetExpr(this);
	}
}
Expr.Get = Get;

class Grouping {
	constructor(expression) {
		this.expression = expression;
	}

	accept(visitor) {
		return visitor.visitGroupingExpr(this);
	}
}
Expr.Grouping = Grouping;


module.exports = Expr;