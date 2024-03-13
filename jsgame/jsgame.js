import { register } from './register.js';
import { renderer } from './renderer.js';

// Game class
export class game {
	static instance = null;
	constructor(options={}) {
		if (game.instance==null) {
			game.instance = this;
			console.log("Creating game with options:")
			for (let key in defaultOptions) {
				let val = options[key]||defaultOptions[key];
				let str = val;
				if (typeof(val)=="object") {
					for (let key2 in val) {
						str = ""+str+"\n    "+key2+": "+val[key2];
					}
				}
				if (typeof(val)=="function") {
					str = "function";
				}
				console.log(`  ${key}: ${str}`);
			}

			this.targetMS = 1000000 / (options.frameRate || defaultOptions.frameRate);
			this.targetMILS = 1000 / (options.frameRate || defaultOptions.frameRate);
			this.viewPort = options.viewPort || defaultOptions.viewPort;
			this.debugLogging = options.debugLogging || defaultOptions.debugLogging;
			this.canvas = options.canvas;
			this.ctx = this.canvas.getContext("2d");
			this.bgcolor = options.bgcolor || defaultOptions.bgcolor;
			this.onFrame = options.onFrame || defaultOptions.onFrame;
			this.fps = 0;
			this.gravity = options.gravity || defaultOptions.gravity;
			this.airFriction = options.airFriction || defaultOptions.airFriction;
			this.camera = options.camera||defaultOptions.camera;

			this.Input = new Input();
			this.Objects = [];
			this.engine = new renderer({
				canvas: this.canvas,
				camera: this.camera,
				viewPort: this.viewPort
			});

			this.textures = new register();
			this.textures.set("missing", new Image("./jsgame/assets/missing.png"));
		} else {
			console.error("Game instance already exists!");
		}
	}

	update() {
		const canvas = this.canvas,
			ctx = this.ctx;
		if (this.viewPort.type === "static") {
			canvas.width = this.viewPort.width;
			canvas.height = this.viewPort.height;
		} else if (this.viewPort.type === "fit") {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			this.viewPort.width = canvas.width;
			this.viewPort.height = canvas.height;
		}

		ctx.fillStyle = this.bgcolor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (let object of this.Objects) {
			object.physUpdate();
			object.draw(ctx);
		}
	}

	run() {
		const loop = () => {
			this.fps++;
			const start = performance.now();

			this.update();
			this.onFrame();

			const end = performance.now();
			const elapsed = end - start;
			const delay = Math.max(this.targetMS - elapsed, 0);

			setTimeout(() => loop(), delay/1000);
		};

		const perf = () => {
			if (this.debugLogging) {console.log(this.fps)}
			this.fps = 0;
			setTimeout(() => {
				perf();
			}, 1000);
		};

		loop();
		perf();
	}

	addObject(obj) {
		this.Objects.push(obj);
	}
}

// Vector2 class
export class Vector2 {
	constructor(x=0, y=0) {
		this.x = x;
		this.y = y;
	}
	add(v) {
		this.x+=v.x;// -------->  <---------
		this.y+=v.y;
	}
	subtract(v) {
		this.x-=v.x;
		this.y-=v.y;
	}
	multiply(v) {
		this.x*=v.x;
		this.y*=v.y;
	}
	divide(v) {
		this.x/=v.x;
		this.y/=v.y;
	}
	scale(s) {
		this.x*=s;
		this.y*=s;
	}
	magnitude(squared=false) {
		let mag = this.x*this.x+this.y*this.y;
		return squared ? mag : Math.sqrt(mag);
	}
	normalize(length=1) {
		let mag = this.magnitude();
		if (mag > 0) {
			this.scale(length/mag);
		} else {
			this.x = 0;
			this.y = length;
		}
	}
	rotate(angle) {
		let rad = angle * Math.PI / 180;
		let x = this.x;
		let y = this.y;
		this.x = x*Math.cos(rad) - y*Math.sin(rad);
		this.y = x*Math.sin(rad) + y*Math.cos(rad);
	}
	angleTowards(v) {
		let rad = Math.atan2(v.y-this.y, v.x-this.x);
		return rad * 180 / Math.PI;
	}
	// for setting to another vector without copying object
	set(v) {
		this.x = v.x;
		this.y = v.y;
	}

	equals(v) {
		return this.x==v.x && this.y==v.y;
	}

	static relativeTo(v) {}
}
export function vec2(x=0, y=0) { return new Vector2(x, y); }

// Location class
export class Location {
	constructor(position, angle=new Vector2(), velocity=new Vector2()) {
		this.position = position;
		this.angle = angle;
		this.velocity = velocity;
	}
	lookTowards(v, nl=1) {
		this.angle.x = v.x-this.position.x;
		this.angle.y = v.y-this.position.y;
		this.angle.normalize(nl);
	}
	show(ctx) {
		// offset position based on camera position/zoom
		const camera = game.instance.camera;
		const vp = game.instance.viewPort;

		let sp = util.worldToScreen(this.position, camera, vp);
		ctx.strokeStyle = "white";
		ctx.strokeWidth = 1;
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, 5, 0, 2*Math.PI);
		ctx.moveTo(sp.x, sp.y);
		ctx.lineTo(sp.x+this.angle.x*20, sp.y+this.angle.y*20);
		ctx.stroke();
	}
}
export function loc(x, y, pitch=0, yaw=0, velx=0, vely=0) { return new Location(vec2(x, y), vec2(pitch, yaw). vec2(velx, vely)); }

// Object class
export class Object {
	constructor(location, options={}) {
		this.location = location;
		this.staticLoc = new Location(new Vector2());
		this.staticLoc.position.set(location.position);
		this.size = options.size || new Vector2(50, 50);
		this.texture = options.texture || "missing";
		this.update = options.update||function () {};
		this.physMode = options.physMode||"dynamic";
		this.onCollision = options.onCollision||function (object) {
			this.location.velocity.scale(0.99);
		};
	}

	draw(ctx) {
		// offset position based on camera position/zoom
		const camera = game.instance.camera;
		const vp = game.instance.viewPort;
		
		let sp = util.worldToScreen(this.location.position, camera, vp);
		let pos = this.location.position;
		let xsize = this.size.x*camera.zoom;
		let ysize = this.size.y*camera.zoom;
		let tex = game.instance.textures.get(this.texture);
		let engine = game.instance.engine;
		if (tex!=null) {
			engine.drawImage(tex,
										pos.x, pos.y,
										this.size.x, this.size.y
									 );
		}
	}

	physUpdate() {
		this.update();
		if (this.physMode=="dynamic") {
			let grav = new Vector2();
			if (game.instance.gravity.type === "absolute") {
				grav.x = game.instance.gravity.x;
				grav.y = game.instance.gravity.y;
			} else if (game.instance.gravity.type === "point") {
				const dx = game.instance.gravity.x - this.location.position.x,
					dy = game.instance.gravity.y - this.location.position.y,
					dist = Math.sqrt(dx*dx+dy*dy);
	
				const fx = (dx / Math.max(dist, 0.0001)) * game.instance.gravity.strength,
					fy = (dy / Math.max(dist, 0.0001)) * game.instance.gravity.strength;
	
				grav.x = fx;
				grav.y = fy;
			}
			
			this.location.velocity.add(grav);

			const separation = 0;
	
			for (let object of game.instance.Objects) {
					if (object === this) {
							continue;
					}
	
					let dx = object.location.position.x - this.location.position.x;
					let dy = object.location.position.y - this.location.position.y;
	
					let combinedHalfWidths = (object.size.x + this.size.x) / 2;
					let combinedHalfHeights = (object.size.y + this.size.y) / 2;
	
					let offsetX = Math.abs(dx) - combinedHalfWidths;
					let offsetY = Math.abs(dy) - combinedHalfHeights;
	
					if (offsetX < 0 && offsetY < 0) {
							// Rectangles are intersecting
							// Adjust positions to resolve collision
							if (offsetX > offsetY) {
									if (dx > 0) {
											this.location.position.x += offsetX-separation;
											object.location.position.x -= offsetX+separation;
									} else {
											this.location.position.x -= offsetX+separation;
											object.location.position.x += offsetX-separation;
									}
							} else {
									if (dy > 0) {
											this.location.position.y += offsetY-separation;
											object.location.position.y -= offsetY+separation;
									} else {
											this.location.position.y -= offsetY-separation;
											object.location.position.y += offsetY+separation;
									}
							}
	
							// Adjust velocities to simulate bouncing
							let relativeVelocityX = this.location.velocity.x - object.location.velocity.x;
							let relativeVelocityY = this.location.velocity.y - object.location.velocity.y;
	
							if (offsetX > offsetY) {
									this.location.velocity.x -= relativeVelocityX;
									object.location.velocity.x += relativeVelocityX;
							} else {
									this.location.velocity.y -= relativeVelocityY;
									object.location.velocity.y += relativeVelocityY;
							}

						let dir = new Vector2();

						// Calculate the direction based on the side of the collision
						if (offsetX < 0 && offsetY < 0) {
								// Rectangles are intersecting
								if (offsetX > offsetY) {
										if (dx > 0) {
												// Collision from the left
												dir.x = -1;
										} else {
												// Collision from the right
												dir.x = 1;
										}
								} else {
										if (dy > 0) {
												// Collision from the top
												dir.y = -1;
										} else {
												// Collision from the bottom
												dir.y = 1;
										}
								}
						}

						let s = new Vector2();
						s.set(dir);
						s.scale(0.1);
						this.onCollision(object, dir);
						this.location.position.add(s);
						dir.scale(-1);
						object.onCollision(this, dir);
						object.location.position.subtract(s);
					}
			}
			
			this.location.velocity.scale(1-game.instance.airFriction);
			
			this.location.position.add(this.location.velocity);
		} else if (this.physMode=="static") {
			this.location.position.set(
				this.staticLoc.position);
			this.location.velocity.set(new Vector2());
		}
	}
}

// Input class
class Input {
	constructor() {
		this.keys = [];
		this.mousePosition = new Vector2();
		this.mouseDown = false;
		this.mouseClicked = false;

		document.addEventListener("keydown", function(e) {
			this.keys[e.key] = true;
			e.preventDefault();
		}.bind(this));
		document.addEventListener("keyup", function(e) {
			this.keys[e.key] = false;
		}.bind(this));
		document.addEventListener("mousemove", function(e) {
			this.mousePosition.x = e.clientX;
			this.mousePosition.y = e.clientY;
		}.bind(this));
		document.addEventListener("mousedown", function(e) {
			this.mouseDown = true;
			this.mouseClicked = true;
		}.bind(this));
		document.addEventListener("mouseup", function(e) {
			this.mouseDown = false;
		}.bind(this));
	}
}

// Useful functions
export class util {
	// Take a world position and return a screen position
	static worldToScreen(vector, camera, vp) {
		/*const camera = game.instance.camera,
			vp = game.instance.viewPort;*/

		// Calculate screen position
		const screenX = (vector.x - camera.position.x) * camera.zoom + vp.width / 2;
		const screenY = (vector.y - camera.position.y) * camera.zoom + vp.height / 2;

		return new Vector2(screenX, screenY);
	}

	// Take a screen position and return a world position
	static screenToWorld(vector, camera, vp) {
		/*const camera = game.instance.camera,
			vp = game.instance.viewPort;*/

		// Calculate world position
		const worldX = (vector.x - vp.width / 2) / camera.zoom + camera.position.x;
		const worldY = (vector.y - vp.height / 2) / camera.zoom + camera.position.y;

		return new Vector2(worldX, worldY);
	}

	static clamp(val, min, max) {
		return Math.max(min, Math.min(max, val));
	}
}

// Default options
const defaultOptions = {
	frameRate: 60,
	bgcolor: "black",
	onFrame: function() {},
	/* other viewport type:
	 viewPort: {
		type: "fit"
	 }
	*/
	viewPort: {
		type: "static",
		width: 400,
		height: 400
	},
	debugLogging: false,
	/* other gravity type:
	gravity: {
		type: "point",
		x: 0,
		y: 0,
		strength: 0.1
	}
	*/
	gravity: {
		type: "absolute",
		x: 0.0,
		y: 0.1
	},
	airFriction: 0.01,
	camera: {
		position: new Vector2(0, 0),
		velocity: new Vector2(0, 0),
		zoom: 1
	}
}