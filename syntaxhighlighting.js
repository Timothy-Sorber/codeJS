const editor = CodeMirror.fromTextArea(document.getElementById("code-box"), {
	mode: "javascript",
	lineNumbers: true, // Optionally, add line numbers
	theme: "material-darker",
	styleActiveLine: true,
	matchBrackets: true,
	indentWithTabs: true,
	tabSize: 4,
	autofocus: true,
	indentUnit: 4,
	autoCloseBrackets: true,
	extraKeys: { "Alt": "autocomplete" },
	hintOptions: {
			completeSingle: false
	}
});

function getCodeEditor() {
	return editor;
}

editor.on("change", () => editor.showHint())

function customAutocomplete(editor) {
	var cur = editor.getCursor();
	var token = editor.getTokenAt(cur);
	if (token.string == '') {
		return null;
	}
	var text = editor.getValue();
	var word = token.string;

	// Regular expression to match variable declarations
	var varRegex = /(?:let|var|const|function)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g;

	var suggestions = ['var', 'let', 'const', 'function'];

	// Find all variable declarations in the code
	var match;
	while ((match = varRegex.exec(text)) !== null) {
			suggestions.push(match[1]);
	}

	// Calculate a score for each suggestion based on match closeness
	var scoredSuggestions = suggestions.map(function(suggestion) {
			var score = 0;

			// Score based on how closely the suggestion matches the current word
			if (suggestion.startsWith(word)) {
				score += 3;
			} else if (suggestion.includes(word)) {
				score += 2;
			} else if (suggestion.toLowerCase().startsWith(word.toLowerCase())) {
				score += 1;
			}

			return { suggestion: suggestion, score: score };
	});

	// Remove suggestions with score 0 (no match)
	scoredSuggestions = scoredSuggestions.filter(function(item) {
			return item.score > 0;
	});

	// Sort suggestions based on score in descending order
	scoredSuggestions.sort(function(a, b) {
			return b.score - a.score;
	});

	// Extract the sorted suggestions
	var sortedSuggestions = scoredSuggestions.map(function(item) {
			return item.suggestion;
	});
	if (sortedSuggestions.length <= 1 && sortedSuggestions[0] == token.string) {
		return null;
	}

	return {
			list: sortedSuggestions,
			from: {line: cur.line, ch: cur.ch-token.string.length},
			to: cur
	};
}

// Register the custom autocomplete function for JavaScript mode
CodeMirror.registerHelper("hint", "javascript", customAutocomplete)