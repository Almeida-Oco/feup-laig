/**
 * @description Abstract class which all the animations have to derive from
 * 				every implementation has to have defined the following methods:
 *				updateMatrix -> Calculates a transf matrix with the current animation
 *				calcIntermediateMatrix -> Returns the updateMatrix
 *				calcEndMatrix -> Returns the final Matrix
 *				getType -> Returns the type of animation
 *				assignIndex -> The current animation
 *				calculateDuration -> Time that the animation lasts
 * @constructor
 * @abstract
 */
class Animation {
	constructor(speed, args) {
		this.speed = speed; 					// 1unit / s
		this.animations_over = [];		// if the animation is over
		this.durations = []; 					// the total duration of the animations
		this.total_time = []; 				// will hold the different progresses of the nodes
    this.last_pt = [];            // will hold the last point of the animation

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
	 * @description Sees if a animation has finished
	 * @param assigned_index the index of the animation that we want to check
	 */
	checkAnimationOver (assigned_index) {
		return (this.total_time[assigned_index] >= this.durations[assigned_index]);
	}
	/**
	 * @description Gets the duration of a animation
	 * @param assigned_index the index of the animation that we want to check
	 */
	getDuration (assigned_index) {
		return this.durations[assigned_index];
	}
	/**
	 * @description Returns the animation that has already finished
	 * @param assigned_index the index of the animation that we want to check
	 */
	animationOver (assigned_index) {
		return this.animations_over[assigned_index];
	}
	/**
	 * @description Returns the time that will take to finish until the animation
	 * @param assigned_index the index of the animation that we want to check
	 */
	getTotalTime (assigned_index) {
		return this.total_time[assigned_index];
	}
	/**
	 * @description Sets a animation to be finished
	 * @param assigned_index the index of the animation that we want to check
	 */
	setAnimationOver (assigned_index) {
		this.animations_over[assigned_index] = true;
	}
	/**
	 * @description Increments the total time of a animation by a amount (inc)
	 * @param assigned_index the index of the animation that we want to check
	 * @param inc the value to add
	 */
	incTotalTime (assigned_index, inc) {
		this.total_time[assigned_index] += inc;
	}
	/**
	 * @description Resets the timed passed in the assigned index animation
	 * @param assigned_index the index of the animation that we want to check
	 */
	resetTotalTime (assigned_index) {
		this.total_time[assigned_index] = 0;
	}
	/**
	 * @description Normalizes all the coordinates of a vector
	 * @param vec1 vec1
	 * @return vec1/||vec1||
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

		return vector;
	}
	/**
	 * @description Calculates the dot product of two vectors (vec3)
	 * @param vec1 vec1
	 * @param vec2 vec2
	 * @return vec1 . vec2
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
	 * @description Calculates the Cross product of two vectors (vec3)
	 * @param vec1 vec1
	 * @param vec2 vec2
	 * @return vec1 x vec2
	 */
	crossProduct (vec1, vec2) {
		return [vec1[1]*vec2[2] - vec1[2]*vec2[1],
						vec1[0]*vec2[2] - vec1[2]*vec2[0],
						vec1[0]*vec2[1] - vec1[1]*vec2[0]];
	}

	/**
	 * @description Calculates the linear interpolation between the values
	 * @param assigned_index Index assigned to the node
	 * @param min Start value
	 * @param max End value
	 * @param t Time elapsed since last function call
	 * @return The interpolated value
	 */
	linearInterpolation (assigned_index, min, max, t) {
		let passed = t/this.durations[assigned_index];
		return (1 - passed) * min + (passed * max);
	}
};
