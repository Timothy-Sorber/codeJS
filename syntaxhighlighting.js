const editor = CodeMirror.fromTextArea(document.getElementById("code-box"), {
	mode: "javascript",
	lineNumbers: true, // Optionally, add line numbers
	theme: "color",
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

// Function to find the AST node at a given character index
function findNodeAtPosition(node, position) {
	if (node && typeof node === 'object' && node.start <= position && node.end >= position) {
		for (const key in node) {
			if (key !== 'parent' && typeof node[key] === 'object') {
				const result = findNodeAtPosition(node[key], position);
				if (result) return result;
			}
		}
		return node;
	}
	return null;
}

editor.on("change", () => editor.showHint())

function customAutocomplete(editor) {
	var cur = editor.getCursor();
	var token = editor.getTokenAt(cur);
	if (token.string == '') {
		return null;
	}
	console.log(token.string)
	var text = editor.getValue();
	var word = token.string.toLowerCase();

	var suggestions = [
		{text: 'var', type: 'keyword'},
		{text: 'let', type: 'keyword'},
		{text: 'const', type: 'keyword'},
		{text: 'function', type: 'keyword'},
		{text: 'if', type: 'keyword'},
		{text: 'else', type: 'keyword'},
		{text: 'for', type: 'keyword'},
		{text: 'while', type: 'keyword'},
		{text: 'drawRect', type: 'function'},
		{text: 'fillRect', type: 'function'},
		{text: 'drawCircle', type: 'function'},
		{text: 'fillCircle', type: 'function'},
		{text: 'rgb', type: 'function'},
		{text: 'clone', type: 'function'},
		{text: 'recursiveClone', type: 'function'}
	];

	// Regular expression to match variable declarations
	var varRegex = /(?:let|var|const)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g;
	var funcRegex = /function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g;

	let vmatch;
	while ((vmatch = varRegex.exec(text)) != null) {
		suggestions.push({text: vmatch[1], type: 'variable'});
	}

	let fmatch;
	while ((fmatch = funcRegex.exec(text)) != null) {
		if (fmatch[1] == 'draw') {
			continue;
		}
		suggestions.push({text: fmatch[1], type: 'function'});
	}
	
	let scoredSuggestions = [];
	
	for (let suggestion of suggestions) {
		let score = 0,
			text = suggestion.text.toLowerCase();

		if (text.startsWith(word)) {
			score += 3;
		} else if (text.includes(word)) {
			score += 2;
		} else {
			score += 0;
		}

		scoredSuggestions.push({suggestion: suggestion, score: score});
	}

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
	if (sortedSuggestions.length == 0) {
		return null;
	}
	let completeSuggestions = [];

	for (let suggestion of sortedSuggestions) {
		if (suggestion.text.toLowerCase()==
			 word.toLowerCase()) {
			continue;
		}
		completeSuggestions.push({
			text: suggestion.text,
			displayText: suggestion.text,
			type: suggestion.type,
			render: (el, cm, data) => {
				const icon = document.createElement("span");
				icon.innerHTML = `<img src="images/${data.type}.png" width="8px" height="8px"> `;
				el.appendChild(icon);
				
				const text = document.createElement("span");
				text.innerText = data.displayText;
				el.appendChild(text);
			}
		});
	}

	return {
		list: completeSuggestions,
		from: {line: cur.line, ch: cur.ch-token.string.length},
		to: cur
	};
}

// Register the custom autocomplete function for JavaScript mode
CodeMirror.registerHelper("hint", "javascript", customAutocomplete)