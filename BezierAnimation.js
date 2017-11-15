/**
 * @constructor
 * @param id ID of the animation
 * @param speed Speed of the animation
 * @param args Arguments of animation [[x,y,z],[x1,y1,z1] (...)]
 */
class BezierAnimation extends Animation {
	constructor(speed, args) {
		super(speed, args);
		this.pts = args;
		this.speed = speed;
	}

	updateMatrix(transformation_matrix) {
		console.log("\n\n MEOW \n\n");
	}

	get getType() {
		return "BezierAnimation";
	}

	assignIndex () {
		console.log("MEOW");
	}
};
