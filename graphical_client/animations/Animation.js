/**
 * @description Holds the variables which are common between animations.
 * 							Should multiple nodes use the same animation, the variables which store the progress of the
 *							animation will be stored inside arrays, and the node shall be given an index to access those variables
 *								see assignIndex().
 * @class
 * @abstract
 * @member {float} speed The speed of the animation
 * @member {Array<bool>} animations_over An array containing booleans that says if the animation of the index is over
 * @member {Array<float>} durations An array with the total duration of the animations
 * @member {Array<float>} total_time Time passed since start of animation
 */
class Animation {
	/**
	 * @constructor
	 * @description Constructor of class
	 * @memberof Animation
	 * @param {float} speed The speed of the animation
	 * @param {Array<T>} args Arguments of the animation
	 */
	constructor(speed, args) {
		this.speed = speed;
		this.animations_over = [];
		this.durations = [];
		this.total_time = [];
    this.last_pt = [];

		if (this.constructor === Animation) {
      throw new TypeError("Can't instantiate abstract class!");
    }

		if (this.updateMatrix === undefined) {
			throw new TypeError("Classes inheriting from Animation must implement updateMatrix()");
		}

    if (this.calcIntermediateMatrix === undefined){
      throw new TypeError("Classes inheriting from Animation must implement calcIntermediateMatrix()");
    }

    if (this.calcEndMatrix === undefined){
      throw new TypeError("Classes inheriting from Animation must implement calcEndMatrix()");
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

	/**
	 * @memberof Animation
	 * @description Checks if a animation has finished
	 * @param {int} assigned_index The index assigned to the node
	 * @return true if animation over, false otherwise
	 */
	checkAnimationOver (assigned_index) {
		return (this.total_time[assigned_index] >= this.durations[assigned_index]);
	}

	/**
	 * @memberof Animation
	 * @description Gets the duration of a animation
	 * @param {int} assigned_index The index assigned to the node
	 * @return The duration of the animation
	 */
	getDuration (assigned_index) {
		return this.durations[assigned_index];
	}

	/**
	 * @memberof Animation
	 * @description Gets the {@link animations_over} in the given index
	 * @param {int} assigned_index The index assigned to the node
	 * @return true if animation over, false otherwise
	 */
	animationOver (assigned_index) {
		return this.animations_over[assigned_index];
	}

	/**
	 * @memberof Animation
	 * @description Gets the {@link total_time} in the given index
	 * @param {int} assigned_index The index assigned to the node
	 * @return The total time elapsed since the start of the animation
	 */
	getTotalTime (assigned_index) {
		return this.total_time[assigned_index];
	}

	/**
	 * @memberof Animation
	 * @description Sets {@link animations_over} to true in the given index
	 * @param {int} assigned_index The index assigned to the node
	 */
	setAnimationOver (assigned_index) {
		this.animations_over[assigned_index] = true;
	}

	/**
	 * @memberof Animation
	 * @description Increments the {@link total_time} in the given index
	 * @param {int} assigned_index The index assigned to the node
	 * @param inc The value to increment
	 */
	incTotalTime (assigned_index, inc) {
		this.total_time[assigned_index] += inc;
	}

	/**
	 * @memberof Animation
	 * @description Resets the {@link total_time}, in the given index, to zero
	 * @param {int} assigned_index The index assigned to the node
	 */
	resetTotalTime (assigned_index) {
		this.total_time[assigned_index] = 0;
	}

	/**
	 * @memberof Animation
	 * @description Normalizes the given vector
	 * @param vec1 The vector to normalize
	 */
	normalizeVector (vector) {
		let division = 0;
		for (let i = 0; i < vector.length; i++) {
			division += Math.pow(vector[i], 2);
		}
		division = Math.sqrt(division);
		for (let i = 0; i < vector.length && division != 0; i++){
			vector[i] /= division;
		}
	}

	/**
	 * @memberof Animation
	 * @description Calculates the dot product of two vectors (The vectors should be normalized using {@link normalizeVector})
	 * @param vec1 The first normalized vector
	 * @param vec2 The second normalized vector
	 * @return The result of the dot product
	 */
	dotProduct (vec1, vec2)  {
		if (vec1.length != vec2.length){
			throw new Error("ERROR! Vector lengths are different, vec1 = "+vec1.length+", vec2 = "+vec2.length);
		}
		let result = 0;
		for (let i = 0; i < vec1.length; i++) {
			result += vec1[i]*vec2[i];
		}
		return result;
	}


	/**
	 * @memberof Animation
	 * @description Calculates the Cross product of two vectors (The vectors should be normalized using {@link normalizeVector})
	 * @param vec1 The first normalized vector
	 * @param vec2 The second normalized vector
	 * @return The result of the cross product
	 */
	crossProduct (vec1, vec2) {
		return [vec1[1]*vec2[2] - vec1[2]*vec2[1],
						vec1[0]*vec2[2] - vec1[2]*vec2[0],
						vec1[0]*vec2[1] - vec1[1]*vec2[0]];
	}


	/**
	 * @memberof Animation
	 * @description Calculates the linear interpolation between the values
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} min Start value
	 * @param {float} max End value
	 * @param {float} t Time elapsed since last function call
	 * @return The interpolated value
	 */
	linearInterpolation (assigned_index, min, max, t) {
		let passed = t/this.durations[assigned_index];
		return (1 - passed) * min + (passed * max);
	}
};
