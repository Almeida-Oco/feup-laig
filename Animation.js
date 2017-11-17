/**
 * @constructor
 * @abstract
 */
class Animation {
	constructor(speed, args) {
		this.speed = speed; 					// 1unit / s
		this.animations_over = [];		// if the animation is over
		this.durations = []; 					// the total duration of the animations
		this.total_time = []; 				// will hold the different progresses of the nodes

		if (this.constructor === Animation) {
      throw new TypeError("Can't instantiate abstract class!");
    }

		if (this.updateMatrix === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement updateMatrix()");
		}

		if (this.getType === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement getType()");
		}

		if (this.assignIndex === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement assignIndex()");
		}

		if (this.calculateDuration === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement calculateDuration()");
		}
	};

	getDuration (assigned_index) {
		return this.durations[assigned_index];
	}

	animationOver (assigned_index) {
		return this.animations_over[assigned_index];
	}

	getTotalTime (assigned_index) {
		return this.total_time[assigned_index];
	}

	setAnimationOver (assigned_index) {
		this.animations_over[assigned_index] = true;
	}

	incTotalTime (assigned_index, inc) {
		this.total_time[assigned_index] += inc;
	}

	resetTotalTime (assigned_index) {
		this.total_time[assigned_index] = 0;
	}

	/**
	 * @description Calculates the linear interpolation between the values
	 * @param assigned_index Index assigned to the node
	 * @param min Start value
	 * @param max End value
	 * @param t Percentage of time elapsed, values between [0,1]
	 * @return The interpolated value
	 */
	linearInterpolation (assigned_index, min, max, t) {
		let duration = this.getDuration(assigned_index);
		if (this.total_time[assigned_index] > duration) //interpolation over
			return max;
		else{
			return (1 - t) * min + (t * max);
		}
	}
};
