/**
 * @constructor
 * @param id ID of the animation
 * @param speed Speed of the animation
 * @param args Arguments of animation [[x,y,z],[x1,y1,z1] (...)]
 */
class BezierAnimation extends Animation {
	constructor(id, speed, args) {
		super();
		this.pts = args;
		this.speed = speed;
		this.id = id;
	}

	tickTock() {
		console.log("\n\n MEOW \n\n");
	}
};
