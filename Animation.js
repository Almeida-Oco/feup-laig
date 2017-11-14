/**
 * @constructor
 * @abstract
 */
class Animation {
	animationOver() {
		return this.animation_over;
	};

	constructor(speed, args) {
		// 1unit / s
		this.speed = speed;
		this.animation_over = false;
		this.duration = 0; //the total duration of this animation
		this.total_time = 0;

		if (this.constructor === Animation) {
      throw new TypeError("Can't instantiate abstract class!");
    }

		if (this.updateMatrix === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement updateMatrix()");
		}

		if (this.getType === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement getType()");
		}
	};

	linearInterpolation (min, max, t) {
		let passed = t / this.duration;
		if (t > this.duration) //interpolation over
			return max;
		else{
			return (1 - passed) * min + (passed * max);
		}
	}

	static calculateDuration(pt1, pt2, speed) {
		return this.ptsDistance(pt1, pt2) / speed;
	};

	static ptsDistance(pt1, pt2) {
		return Math.sqrt(Math.pow(pt1[0]-pt2[0], 2) + Math.pow(pt1[1]-pt2[1], 2) + Math.pow(pt1[2]-pt2[2], 2));
	};
};
