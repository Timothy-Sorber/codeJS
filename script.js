const canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	codearea = document.getElementById("code-area"),
	codebox = document.getElementById("code-box"),
	consolediv = document.getElementById("console"),
	dispdiv = document.getElementById("disp");

codebox.addEventListener('keydown', function(e) {
		// Check if the pressed key is the Tab key
		if (e.key === 'Tab') {
				// Prevent the default Tab behavior (changing focus)
				e.preventDefault();

				// Get the current cursor position
				var start = this.selectionStart;
				var end = this.selectionEnd;

				// Insert a tab character at the cursor position
				var tab = '    ';
				this.value = this.value.substring(0, start) + tab + this.value.substring(end);

				// Move the cursor to the right
				this.selectionStart = this.selectionEnd = start + tab.length;
		} else if (e.key === 's' && e.ctrlKey) {
			e.preventDefault();
			run();
		}
});

let lsize;

function loop() {
	let size = Math.min(innerWidth/2, innerHeight/2);
	if (lsize!=size) {
		let editor = getCodeEditor();
		canvas.width = size;
		canvas.height = size;
		codearea.style.left = size*1.2+"px";
		codearea.style.width = innerWidth - size*1.2+"px";
		codebox.style.width = codearea.style.width;
		editor.setSize(codearea.style.width, innerHeight);
		consolediv.style.width = size+"px";
		consolediv.style.height = innerHeight-size*1.25+"px";
		dispdiv.style.width = size+"px";
		lsize = size;
	}
	if (typeof draw == "function") {
		draw();
	}
	requestAnimationFrame(loop);
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

let events = {
	onframe: []
}

function onEvent(type, listener) {
	if (events[type]) {
		events[type].push(listener);
	}
}

let running = false;
let runbutton = document.getElementById("run");
runbutton.onclick = run;
function run() {
	if (!running) {
		let code = getCodeEditor().getValue();
		console.log(code);
		if (code.includes("function draw()")) {
			code += ";; onEvent('onframe', draw);"
		}
		try {
			eval(code);
			if (events.onframe.length>0) {
				running = true;
				runbutton.className = "stop";
				runbutton.innerText = "Stop";
				gameLoop();
			}
		} catch(err) {
			error(err);
		}
	} else {
		running = false;
		runbutton.className = "run";
		runbutton.innerText = "Run";
		fillRect(0, 0, 400, 400, 'white');
	}
}

function gameLoop() {
	for (let i=0; i<events.onframe.length; i++) {
		events.onframe[i]();
	}
	
	if (running) {
		requestAnimationFrame(gameLoop);
	} else {
		for (let k in events) {
			events[k] = [];
		}
	}
}

loop();