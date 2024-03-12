import { Vector2, util } from './jsgame.js';

export class renderer {
	constructor(options={}) {
		this.options = options;
		this.canvas = options.canvas;
		this.camera = options.camera;
		this.viewPort = options.viewPort;
		this.ctx = this.canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.webkitImageSmoothingEnabled = false;
		this.ctx.mozImageSmoothingEnabled = false;
		this.ctx.msImageSmoothingEnabled = false;
		this.ctx.oImageSmoothingEnabled = false;
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.font = "16px monospace";
		this.ctx.fillStyle = "white";
		this.ctx.strokeStyle = "black";
		this.ctx.lineWidth = 1;
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
	}
	
	drawRect(x, y, width, height, color, fill=true, lineWidth=1, adjustPos=true) {
		let pos = new Vector2(x, y);
		let size = new Vector2(width, height);
		if (adjustPos) {
			pos = util.worldToScreen(pos, this.camera, this.viewPort);
			size.scale(this.camera.zoom);
		}
		this.ctx.fillStyle = color;
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = lineWidth;
		if (fill) {
			this.ctx.fillRect(pos.x, pos.y, size.x, size.y);
		} else {
			this.ctx.drawRect(pos.x, pos.y, size.x, size.y);
		}
	}

	drawCircle(x, y, radius, color, fill=true, adjustPos=true) {
		let pos = new Vector2(x, y);
		if (adjustPos) {
			pos = util.worldToScreen(pos, this.camera, this.viewPort);
			radius=radius*this.camera.zoom;
		}
		this.ctx.fillStyle = color;
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = lineWidth;
		this.ctx.beginPath();
		this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
		if (fill) {
			this.ctx.fill();
		} else {
			this.ctx.stroke();
		}
	}

	drawText(text, x, y, color, font="16px monospace", adjustPos=true) {
		let pos = new Vector2(x, y);
		if (adjustPos) {
			pos = util.worldToScreen(pos, this.camera, this.viewPort);
		}
		this.ctx.fillStyle = color;
		this.ctx.font = font;
		this.ctx.fillText(text, pos.x, pos.y);
	}

	drawLine(x1, y1, x2, y2, color, lineWidth=1, adjustPos=true) {
		let pos1 = new Vector2(x1, y1),
			pos2 = new Vector2(x2, y2);
		if (adjustPos) {
			pos1 = util.worldToScreen(pos1, this.camera, this.viewPort);
			pos2 = util.worldToScreen(pos2, this.camera, this.viewPort);
		}
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = lineWidth;
		this.ctx.beginPath();
		this.ctx.moveTo(pos1.x, pos1.y);
		this.ctx.lineTo(pos2.x, pos2.y);
		this.ctx.stroke();
	}

	drawImage(image, x, y, width, height, adjustPos=true) {
		let pos = new Vector2(x, y);
		let size = new Vector2(width, height);
		if (adjustPos) {
			pos = util.worldToScreen(pos, this.camera, this.viewPort);
			size.scale(this.camera.zoom);
		}
		if (image.complete) {
			this.ctx.drawImage(image, pos.x-size.x/2, pos.y-size.y/2, size.x, size.y);
		}
	}
}