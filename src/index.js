const fs = require("fs");
const readline = require("readline");
const Scanner = require("./scanner");
const Parser = require("./parser");
const Resolver = require("./resolver");
const Interpreter = require("./interpreter");
const TokenType = require("./tokentype");

class Lox {
	
	constructor() {
		this.hadError = false;
		this.hadRuntimeError = false;
		this.interpreter = new Interpreter(this);
	}

	runFile(file) {
		const script = fs.readFileSync(file, "UTF-8");
		this.run(script);
		if (this.hadError) process.exit(65);
		if (this.hadRuntimeError) process.exit(70);
	}

	runPrompt() {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		rl.setPrompt("> ");
		rl.prompt();
		rl.on("line", (line) => {
			this.run(line);
			this.hadError = false;
			this.hadRuntimeError = false;
			rl.prompt();
		});
	}

	run(source) {
		const scanner = new Scanner(this, source);
		const tokens = scanner.scanTokens();

		const parser = new Parser(this, tokens);

		const statements = parser.parseProgram();

		if (this.hadError) return;

		const resolver = new Resolver(this);
		const locals = resolver.resolve(statements);

		if (this.hadError) return;

		this.interpreter.interpret(statements, locals);
	}

	report(line, where, message) {
		console.error(`[line ${line}] Error ${where}: ${message}`);
		this.hadError = true;
	}

	error(token, message) {
		if (typeof token == "number") {
			this.report(token, "", message);
		} else {
			if (token.type == TokenType.EOF) {
				this.report(token.line, " at end", message);
			} else {
				this.report(token.line, ` at '${token.lexeme}'`, message)
			}
		}
	}

	runtimeError(error) {
		console.error(`${error.message}`);
		if (error.token) {
			console.error(`[line ${error.token.line}]`);
		}
		this.hadRuntimeError = true;
	}

}

module.exports = new Lox();
