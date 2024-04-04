let consolediv = document.getElementById("console"),
	ctx = document.getElementById("canvas").getContext("2d"),
	lsize = 400;


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

function setLSize(num) {
	lsize = num;
}

function drawRect(x, y, w, h, color="black", lineWidth=2) {
	ctx.strokeStyle = color;
	let sfact = lsize/400;
	ctx.lineWidth = lineWidth*sfact;
	ctx.strokeRect(x*sfact, y*sfact, w*sfact, h*sfact);
}

function fillRect(x, y, w, h, color="black") {
	ctx.fillStyle = color;
	let sfact = lsize/400;
	ctx.fillRect(x*sfact, y*sfact, w*sfact, h*sfact);
}

function drawLine(x1, y1, x2, y2, color="black", lineWidth=2) {
	ctx.strokeStyle = color;
	let sfact = lsize/400;
	ctx.lineWidth = lineWidth*sfact;
	ctx.beginPath();
	ctx.moveTo(x1*sfact, y1*sfact);
	ctx.lineTo(x2*sfact, y2*sfact);
	ctx.stroke();
}

function drawCircle(x, y, r, color="black", lineWidth=2) {
	ctx.strokeStyle = color;
	let sfact = lsize/400;
	ctx.lineWidth = lineWidth*sfact;
	ctx.beginPath();
	ctx.arc(x*sfact, y*sfact, r*sfact, 0, 2 * Math.PI);
	ctx.stroke();
}

function fillCircle(x, y, r, color="black") {
	ctx.fillStyle = color;
	let sfact = lsize/400;
	ctx.beginPath();
	ctx.arc(x*sfact, y*sfact, r*sfact, 0, 2 * Math.PI);
	ctx.fill();
}

function textHAlign(halign) {
	ctx.textAlign = halign;
}
function textVAlign(valign) {
	ctx.textBaseline = valign;
}
function textAlign(halign, valign) {
	ctx.textAlign = halign;
	ctx.textBaseline = valign;
}

function drawText(text, x, y, color="black", font={size: 16, family: "monospace"}) {
	ctx.fillStyle = color;
	let sfact = lsize/400;
	ctx.font = (font.size*sfact)+"px "+font.family;
	ctx.fillText(text, x*sfact, y*sfact);
}