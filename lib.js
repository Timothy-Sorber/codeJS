let consolediv = document.getElementById("console");
function log(text) {
	consolediv.innerHTML += `<div class="log">${text}</div>`;
}
function warn(text) {
	consolediv.innerHTML += `<div class="warning">${text}</div>`;
}
function error(text) {
	consolediv.innerHTML += `<div class="error">${text}</div>`;
}
function clearLog() {
	consolediv.innerHTML = '';
}