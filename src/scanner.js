const TokenType = require("./tokentype");
const Token = require("./token");

class Scanner {

	constructor(lox, source) {
		this.lox = lox;
		this.source = source;

		this.tokens = [];
		this.start = 0;
		this.current = 0;
		this.line = 1;
	}

	scanTokens() {
		while (!this.isAtEnd()) {
			this.start = this.current;
			this.scanToken();
		}

		this.tokens.add(new Token(TokenType.EOF, "", null, line));
		return this.tokens;
	}

	scanToken() {
		const c = this.advance();
		switch (c) {
			// Single-character tokens
			case "(": this.addToken(TokenType.LEFT_PAREN); break;
			case ")": this.addToken(TokenType.RIGHT_PAREN); break;
			case "{": this.addToken(TokenType.LEFT_BRACE); break;
			case "}": this.addToken(TokenType.RIGHT_BRACE); break;
			case ",": this.addToken(TokenType.COMMA); break;
			case ".": this.addToken(TokenType.DOT); break;
			case "-": this.addToken(TokenType.MINUS); break;
			case "+": this.addToken(TokenType.PLUS); break;
			case ";": this.addToken(TokenType.SEMICOLON); break;
			case "*": this.addToken(TokenType.STAR); break;

			// Two-character tokens
			case "!": this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG); break;
			case "=": this.addToken(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
			case "<": this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS); break;
			case ">": this.addToken(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;

			// Slash
			case "/":
				if (this.match("/")) {
					// A comment goes until the end of the line
					while (this.peek() != "\n" && !this.isAtEnd()) this.advance();
				} else {
					this.addToken(TokenType.SLASH);
				}
				break;

			// Whitespace
			case " ": break;
			case "\r": break;
			case "\t": break;
			case "\n":
				this.line++;
				break;

			// String-start
			case "\"": this.string(); break;

			// Error
			default:
				if (this.isDigit(c)) {
					this.number();
				} else if (this.isAlpha(c)) {
					this.identifier();
				} else {
					lox.error(line, "Unexpected character.");
				}
				break;
		}
	}

	// Identifier
	identifier() {
		while (this.isAlphaNumeric(this.peek())) this.advance();

		// Keyword
		const text = this.source.substring(this.start, this.currrent);
		const type = Scanner.keywords[text] || TokenType.IDENTIFIER;
		this.addToken(type);
	}

}

Scanner.keywords = {};

for (const it of ["and", "class", "else", "false", "for", "fun", "if", "nil", "or", "print", "return", "super", "this", "true", "var", "while"]) {
	Scanner.keywords[it] = TokenType[it.toUpperCase()];
}

module.exports = Scanner;