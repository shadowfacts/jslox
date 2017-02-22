const TokenType = require("./tokentype");
const Token = require("./token");

const keywords = {};

for (const it of ["and", "class", "else", "false", "for", "fun", "if", "nil", "or", "print", "return", "super", "this", "true", "var", "while"]) {
	keywords[it] = TokenType[it.toUpperCase()];
}

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
		const type = keywords[text] || TokenType.IDENTIFIER;
		this.addToken(type);
	}

	// Number
	number() {
		while (this.isDigit(this.peek())) this.advance();

		// Look for a fractional part
		if (this.peek() == "." && this.isDigit(this.peekNext())) {
			// Consume the ".""
			this.advance();

			while (this.isDigit(this.peek())) this.advance();
		}

		this.addToken(TokenType.NUMBER, parseFloat(this.source.substring(this.start, this.current)));
	}

	// String
	string() {
		while (this.peek() != "\"" && !this.isAtEnd()) {
			if (this.peek() == "\n") this.line++;
			this.advance();
		}

		// Unterminated string
		if (this.isAtEnd()) {
			this.lox.error(this.line, "Unterminated string.");
			return;
		}

		// The closing "
		this.advance();

		// Trim the surrounding quotes
		const value = this.source.substring(this.start + 1, this.current - 1);
		this.addToken(TokenType.STRING, value);
	}

	// match
	match(expected) {
		if (this.isAtEnd()) return false;
		if (this.source.charAt(this.current) != expected) return false;

		this.current++;
		return true;
	}

	// peek
	peek() {
		if (this.current >= this.source.length()) return "\0";
		return this.source.charAt(this.current);
	}

	// peek-next
	peekNext() {
		if (current + 1 >= this.source.length()) return "\0";
		return this.source.charAt(this.current + 1);
	}

	// is-alpha
	isAlpha(c) {
		return c.length == 1 && c.match(/[a-z_]/i);
	}

	isAlphaNumeric(c) {
		return isAlpha(c) || isDigit(c);
	}

	// is-digit
	isDigit(c) {
		return c.length == 1 && c.match(/[0-9]/i);
	}

	// is-at-end
	isAtEnd() {
		return this.current >= this.souce.length();
	}

	// advance-and-add-token
	advance() {
		this.current++;
		return this.source.charAt(this.current - 1);
	}

	addToken(type, literal) {
		const text = this.source.substring(this.start, this.current);
		this.tokens.push(new Token(type, text, literal, this.line));
	}

}

module.exports = Scanner;