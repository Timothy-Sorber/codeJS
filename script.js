import { game, Location, Vector2, Object } from './jsgame/jsgame.js';

const canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	Game = new game({
		frameRate: 60,
		bgcolor: "black",
		canvas: canvas,
		viewPort: {
			type: "fit"
		},
		gravity: {
			type: "absolute",
			x: 0,
			y: 0.1,
			strength: 0.1
		},
		camera: {
			position: new Vector2(-475, -500),
			velocity: new Vector2(0, 0),
			zoom: 1
		},
		airFriction: 0.01,
		onFrame: function() {
			let loc = new Location(new Vector2());
			loc.lookTowards(this.Objects[0].location.position);
			loc.show(this.ctx);

			// Move the camera smoothy towards the players position
			const dx = this.Objects[0].location.position.x - this.camera.position.x;
			const dy = this.Objects[0].location.position.y - this.camera.position.y

			this.camera.position.x += dx * 0.1;
			this.camera.position.y += dy * 0.1;
		}
	});

Game.addObject(new Object(
	new Location(new Vector2(-475, -500)), {
		texture: "player",
		size: new Vector2(50, 50),
		update: function() {
			if (this.jumpCooldown==undefined) {
				this.jumpCooldown = 0;
				this.jumps = 0;
			}
			this.jumpCooldown--;
			if ((game.instance.Input.keys["w"]||game.instance.Input.keys["up"])&&this.jumps>0&&this.jumpCooldown<=0) {
				this.location.position.y-=1;
				this.location.velocity.add(new Vector2(0, -5.5));
				this.jumps--;
				this.jumpCooldown=30;
			}
			if (game.instance.Input.keys["a"]||game.instance.Input.keys["left"]) {
				this.location.velocity.add(new Vector2(-0.2, 0));
			}
			if (game.instance.Input.keys["s"]||game.instance.Input.keys["down"]) {
				this.location.velocity.add(new Vector2(0, 0.2));
			}
			if (game.instance.Input.keys["d"]||game.instance.Input.keys["right"]) {
				this.location.velocity.add(new Vector2(0.2, 0));
			}
			if (this.location.position.y>100) {
				this.location.position.set(new Vector2(-475, -500));
				this.location.velocity.set(new Vector2());
			}
		},
		onCollision: function(object, dir) {
			this.location.velocity.scale(0.93);

			if (object.texture=="fnuuy") {
				object.physMode = "dynamic";
				object.update = function () {
					if (this.location.position.y>100) {
						this.location.position.set(new Vector2(-400, -500));
						this.location.velocity.set(new Vector2());
					}
				}
			}
			
			if (dir.y==-1) {
				this.jumps = 2;
			}
			if (dir.x!=0) {
				this.jumps = 1;
			}
		}
	}
));
// The floor texture is just a screenshot of the code defining the floor XD
Game.addObject(new Object(
	new Location(new Vector2(0, 200)), {
		physMode: "static",
		size: new Vector2(1000, 250),
		texture: "floor",
		onCollision: function(object, dir) {
			this.location = new Location(new Vector2(0, 200));
		}
	}
));
Game.addObject(new Object(
	new Location(new Vector2(0, 50)), {
		physMode: "static",
		texture: "fnuuy"
	}
));
Game.addObject(new Object(
	new Location(new Vector2(150, 0)), {
		physMode: "static",
		texture: "fnuuy"
	}
));
Game.addObject(new Object(
	new Location(new Vector2(0, -100)), {
		physMode: "static",
		texture: "fnuuy"
	}
));
Game.addObject(new Object(
	new Location(new Vector2(-150, -200)), {
		physMode: "static",
		texture: "fnuuy"
	}
));
Game.addObject(new Object(
	new Location(new Vector2(500, -400)), {
		physMode: "static",
		texture: "fnuuy"
	}
));
Game.addObject(new Object(
	new Location(new Vector2(50, -300)), {
		physMode: "static",
		texture: "arrow"
	}
));
Game.addObject(new Object(
	new Location(new Vector2(-525, 100)), {
		physMode: "static",
		texture: "nerd",
		size: new Vector2(50, 1000)
	}
));
Game.addObject(new Object(
	new Location(new Vector2(-1000, -425)), {
		physMode: "static",
		texture: "a tack",
		size: new Vector2(1000, 50)
	}
));

let floor = new Image();
floor.src = "./assets/floor.png";
Game.textures.set("floor", floor);

let fnuuy = new Image();
fnuuy.src = "./assets/fnuuy.png";
Game.textures.set("fnuuy", fnuuy);

let arrow = new Image();
arrow.src = "./assets/arrow.png";
Game.textures.set("arrow", arrow);

let nerd = new Image();
nerd.src = "./assets/nerd.png";
Game.textures.set("nerd", nerd);

let aTack = new Image();
aTack.src = "./assets/a tack on titan.png";
Game.textures.set("a tack", aTack);

let player = new Image();
player.src = "./assets/player.png";
Game.textures.set("player", player);

for (let i=0; i<10; i++) {
	Game.addObject(new Object(
		new Location(new Vector2(Math.random()*1000-500, -400)), {
			physMode: "static",
			texture: "fnuuy"
		}
	));
}

document.addEventListener("wheel", function(e) {
	Game.camera.zoom -= e.deltaY * 0.01;
	Game.camera.zoom = Math.max(0.1, Math.min(5, 					Game.camera.zoom));
});

Game.run();