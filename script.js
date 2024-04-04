const canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	codearea = document.getElementById("code-area"),
	codebox = document.getElementById("code-box"),
	consolediv = document.getElementById("console"),
	dispdiv = document.getElementById("disp");

let editor = getCodeEditor();

codebox.addEventListener('keydown', function(e) {
		if (e.key === 'c') {
			editor.replaceSelection("}");
		}
});

let lsize;

function getScreenFactor() {
	return lsize/400;
}

function loop() {
	let size = Math.min(innerWidth/2, innerHeight/2);
	if (lsize!=size) {
		canvas.width = size;
		canvas.height = size;
		codearea.style.left = size*1.2+"px";
		codearea.style.width = innerWidth - size*1.2+"px";
		codebox.style.width = codearea.style.width;
		editor.setSize(codearea.style.width, innerHeight);
		let rect = consolediv.getBoundingClientRect();
		console.log(rect.top);
		consolediv.style.width = size;
		consolediv.style.height = innerHeight-rect.top-24 + "px";
		dispdiv.style.width = size+"px";
		lsize = size;
	}
	setLSize(lsize);
	requestAnimationFrame(loop);
}

let events = {
	onFrame: []
}

function onEvent(type, listener) {
	if (events[type]) {
		events[type].push(listener);
	}
}

let savebutton = document.getElementById("save");
savebutton.onclick = () => {
	let code = editor.getValue();
	let blob = new Blob([code], {type: "text/plain;charset=utf-8"});
	let a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = "code.js";
	a.click();
}


let running = false;
let runbutton = document.getElementById("run");
runbutton.onclick = run;
function run() {
	if (!running) {
		let code = getCodeEditor().getValue();
		if (code.includes("function draw()")) {
			code += "\n; onEvent('onFrame', draw);"
		}
		try {
			eval(code);
			if (events.onFrame.length>0) {
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
	for (let i=0; i<events.onFrame.length; i++) {
		events.onFrame[i]();
	}
	
	if (running) {
		requestAnimationFrame(gameLoop);
	} else {
		for (let k in events) {
			events[k] = [];
		}
		fillRect(0, 0, 400, 400, 'white');
	}
}

loop();