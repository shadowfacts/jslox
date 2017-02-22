const TokenType = require("./tokentype");
const Expr = require("./expr");

const synchronizing = [
	TokenType.LEFT_BRACE,
	TokenType.RIGHT_BRACE,
	TokenType.RIGHT_PAREN,
	TokenType.EQUAL,
	TokenType.SEMICOLON
];

class Parser {

	constructor(tokens) {
		this.tokens = tokens;
		this.currentIndex = 0;
	}

	parseProgram() {
		const statements = [];
		while (!this.isAtEnd()) {
			statements.pus
			h(this.declaration());
		}
		return statements;
	}

	parseExpression() {
		return this.assignment();
	}

	declaration() {
		if (this.match(TokenType.CLASS)) return this.classDeclaration();
		if (this.match(TokenType.FUN)) return this.function("function");
		if (this.match(TokenType.VAR)) return this.varDeclaration();
		return this.statement();
	}

	classDeclaration() {
		const name = this.consume(TokenType.IDENTIFIER, "Expect class name.");
		let superclass = null;
		if (this.match(TokenType.LESS)) {
			this.consume(TokenType.IDENTIFIER, "Expect superclass name.");
			superclass = new Expr.Variable(this.previous());
		}

		const methods = [];
		this.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");

		while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
			methods.push(this.function("method"));
		}

		this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

		return new Stmt.Class(name, superclass, methods);
	}

	statement() {
		if (this.match(TokenType.FOR)) return this.forStatement();
		if (this.match(TokenType.IF)) return this.ifStatement();
		if (this.match(TokenType.PRINT)) return this.printStatement();
		if (this.match(TokenType.RETURN)) return this.returnStatement();
		if (this.match(TokenType.WHILE)) return this.whileStatement();
		if (this.check(TokenType.LEFT_BRACE)) return new Stmt.Block(this.block());

		return this.expressionStatement();
	}

	forStatement() {
		this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");

		let initializer;
		if (this.match(TokenType.SEMICOLON)) {
			initializer = null;
		} else if (this.match(TokenType.VAR)) {
			initializer = this.varDeclaration();
		} else {
			initializer = this.expressionStatement();
		}

		let condition = null;
		if (!this.check(TokenType.SEMICOLON)) {
			condition = this.parseExpression();
		}
		this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

		let increment = null;
		if (!this.check(TokenType.RIGHT_PAREN)) {
			increment = new Stmt.Expression(this.parseExpression());
		}
		this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

		let body = this.statement();

		if (increment != null) {
			body = new Stmt.Block([body, increment]);
		}

		if (condition == null) {
			condition = new Expr.Literal(true);
		}
		body = new Stmt.While(condition, body);

		if (initializer != null) {
			body = new Stmt.Block([initializer, body]);
		}

		return body;
	}

	ifStatement() {
		this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
		const condition = this.parseExpression();
		this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

		const thenBranch = this.statement();
		let elseBranch = null;
		if (this.match(TokenType.ELSE)) {
			elseBranch = this.statement();
		}

		return new Stmt.If(condition, thenBranch, elseBranch);
	}

	printStatement() {
		const value = this.parseExpression();
		this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
		return new Stmt.Print(value);
	}

	returnStatement() {
		const keyword = this.previous();
		let value = null;
		if (!this.check(SEMICOLON)) {
			value = this.parseExpression();
		}

		this.consume(TokenType.SEMICOLON, "Expect ';' after return value.");
		return new Stmt.Return(keyword, value);
	}

	varDeclaration() {
		const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");

		let initializer = null;
		if (this.match(TokenType.EQUAL)) {
			initializer = this.parseExpression();
		}

		this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");

		return new Stmt.Var(name, initializer);
	}

	whileStatement() {
		this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
		const condition = this.parseExpression();
		this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
		const body = this.statement();

		return new Stmt.While(condition, body);
	}

	expressionStatement() {
		const expr = this.parseExpression();
		this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
		return new Stmt.Expression(expr);
	}

	function(kind) {
		const name = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name.`);
		this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name`);
		const parameters = [];
		if (!this.check(TokenType.RIGHT_PAREN)) {
			do {
				if (parameters.length > 8) {
					this.error("Cannot have more than 8 parameters");
				}

				parameters.add(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
			} while(this.match(TokenType.COMMA));
		}
		this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

		const body = this.block();
		return new Stmt.Function(name, parameters, body);
	}

	block() {
		this.consume(TokenType.LEFT_BRACE, "Expect '{' before block.");
		const statements = [];

		while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
			statements.push(this.declaration());
		}

		this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");

		return statements;
	}

	assignment() {
		const expr = this.or();

		if (this.match(TokenType.EQUAL)) {
			const equals = this.previous();
			const value = this.assignment();

			if (expr instanceof Expr.Variable) {
				const name = expr.name;
				return new Expr.Assign(name, value);
			} else if (expr instanceof Expr.Get) {
				return new Expr.set(expr.object, expr.name, value);
			}

			this.lox.error(equals, "Invalid assignment target.");
		}

		return expr;
	}

	or() {
		let expr = this.and();

		while (this.match(TokenType.OR)) {
			const operator = this.previous();
			const right = this.and();
			expr = new Expr.Logical(expr, operator, right);
		}

		return expr;
	}

	and() {
		let expr = this.equality();

		while (this.match(TokenType.AND)) {
			const operator = this.previous();
			const right = this.equality();
			expr = new Expr.Logical(expr, operator, right);
		}

		return expr;
	}

	equality() {
		let expr = this.comparison();

		while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
			const operator = this.previous();
			const right = this.comparison();
			expr = new Expr.Binary(expr, operator, right);
		}

		return expr;
	}

	comparison() {
		let expr = this.term();

		while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
			const operator = this.previous();
			const right = this.term();
			expr = new Expr.Binary(expr, operator, right);
		}

		return expr;
	}

	term() {
		let expr = this.factor();

		while (this.match(TokenType.MINUS, TokenType.PLUS)) {
			const operator = this.previous();
			const right = this.factor();
			expr = new Expr.Binary(expr, operator, right);
		}

		return expr;
	}

	factor() {
		let expr = this.unary();

		while (this.match(TokenType.SLASH, TokenType.STAR)) {
			const operator = this.previous();
			const right = this.unary();
			expr = new Expr.Binary(expr, operator, right);
		}

		return expr;
	}

	unary() {
		if (this.match(TokenType.BANG, TokenType.MINUS)) {
			const operator = this.previous();
			const right = this.unary();
			return new Expr.Unary(operator, right);
		}

		return this.call();
	}

	finishCall(callee) {
		const args = [];
		if (!this.check(TokenType.RIGHT_PAREN)) {
			do {
				if (args.length >= 8) {
					this.error("Cannot have more than 8 arguments.");
				}

				args.add(this.parseExpression());
			} while (this.match(TokenType.COMMA));
		}

		const paren = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

		return new Expr.Call(callee, paren, arguments);
	}

	call() {
		let expr = this.primary();

		while (true) {
			if (this.match(TokenType.LEFT_PAREN)) {
				expr = this.finishCall();
			} else if (this.match(TokenType.DOT)) {
				const name = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
				expr = new Expr.Get(expr, name);
			} else {
				break;
			}
		}

		return expr;
	}

	primary() {
		if (this.match(TokenType.FALSE)) return new Expr.Literal(false);
		if (this.match(TokenType.TRUE)) return new Expr.Literal(true);
		if (this.match(TokenType.NIL)) return new Expr.Literal(null);

		if (this.match(TokenType.NUMBER, TokenType.STRING)) {
			return new Expr.Literal(this.previous().literal);
		}

		if (this.match(TokenType.SUPER)) {
			const keyword = this.previous();
			this.consume(TokenType.DOT, "Expect '.' after 'super'.");
			const method = this.consume(TokenType.IDENTIFIER, "Expect superclass method name.");
			return new Expr.Super(keyword, method);
		}

		if (this.match(TokenType.THIS)) return new Expr.This(this.previous());

		if (this.match(TokenType.IDENTIFIER)) return new Expr.Variable(this.previous());

		if (this.match(TokenType.LEFT_PAREN)) {
			const expr = this.parseExpression();
			this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expresion.");
			return new Expr.Grouping(expr);
		}

		this.error("Expect expression.");

		// Discar the token so we can make progres.
		this.advance();
		return null;
	}

	match() {
		for (let i = 0; i < arguments.length; i++) {
			if (this.check(arguments[i])) {
				this.advance();
				return true;
			}
		}

		return false;
	}

	advance() {
		if (!this.isAtEnd()) this.currentIndex++;
		return this.previous();
	}

	check(type) {
		if (this.isAtEnd()) return false;
		return this.current().type == type;
	}

	isAtEnd() {
		return current().type == TokenType.EOF;
	}

	current() {
		return tokens[currentIndex];
	}

	previous() {
		return tokens[currentIndex - 1];
	}

	error(message) {
		this.lox.error(this.current(), message);
	}

}

module.exports = Parser;