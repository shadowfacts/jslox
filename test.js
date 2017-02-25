const lox = require("./src/");
if (process.argv.length > 2) {
	for (let i = 2; i < process.argv.length; i++) {
		lox.runFile(process.argv[i]);
	}
} else {
	lox.runPrompt();
}
