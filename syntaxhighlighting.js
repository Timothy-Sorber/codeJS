const editor = CodeMirror.fromTextArea(document.getElementById("code-box"), {
	mode: "javascript",
	lineNumbers: true, // Optionally, add line numbers
	theme: "material-darker",
	styleActiveLine: true,
	matchBrackets: true,
	indentWithTabs: true,
	tabSize: 4,
	autofocus: true,
	indentUnit: 4
});

function getCodeEditor() {
	return editor;
}

console.log(editor.options);