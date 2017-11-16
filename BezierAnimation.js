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

	updateMatrix(assigned_index, delta, matrix) {
		let bezier_x, bezier_y, bezier_z;
		super.incTotalTime(delta);
		bezier_x
	}

	get getType() {
		return "BezierAnimation";
	}

	calculateDuration () {
		console.log("MEOW");
	}

	assignIndex () {
		let ret = this.animations_over.length;
		this.animations_over.push(false);
		this.total_time.push(0);

		return ret;
	}

	/**
	 * @description Gets the point correspondent with vars[4]
	 * @param assigned_index Index assigned to node
	 * @param vars The array with the 4 variables to use
	 */
	getPoint (assigned_index, vars) {
		let time = super.getTotalTime(assigned_index),
				perc = (super.getDuration(assigned_index)/time);

		let param1 = Math.pow(perc, 3),
				param2 = 3 * time * Math.pow(perc, 2),
				param3 = 3 * Math.pow(time, 2) * perc,
				param4 = Math.pow(time, 3);

		return param1+param2+param3+param4;
	}
};
