/**
 * @constructor
 * @abstract
 */
class Animation {
	constructor(speed, args) {
		function ptsDistance(pt1, pt2) {
			return Math.sqrt(Math.pow(pt1[0]-pt2[0], 2) + Math.pow(pt1[1]-pt2[1], 2) + Math.pow(pt1[2]-pt2[2], 2));
		}
		// 1unit / s
		this.speed = speed;
		this.animation_over = false;
		this.duration = 0; //the total duration of this animation
		this.total_time = 0;
		for (let i = 1; i < args.length; i++) { //calculate total duration based on speed and distance
			this.duration += (ptsDistance( [args[i][0], args[i][1], args[i][2]] ,
																		[args[i-1][0], args[i-1][1], args[i-1][2]] ) / this.speed);
		}

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

	/**
	 * @description Calculates the dot product between the two vectors, normalizing them first
	 * @param arr1 First array to use
	 * @param arr2 Second array to use
	 * @return Dot product, null if there was an error
	 */
	dotProduct(arr1, arr2) {
		let total = 0, div1 = 0, div2 = 0, i = 0;
		if (arr1.length != arr2.length)
			return null;

		for (i = 0; i < arr1.length; i++) {
			div1 += Math.pow(arr1[i],2);
			div2 += Math.pow(arr2[i],2);
		}
		div1 = Math.sqrt(div1);
		div2 = Math.sqrt(div2);

		for (i = 0; i < arr1.length; i++)
			total += ( (arr1[i]/div1)*(arr2[i]/div2) );
		return total;
	};

	get animationOver() {
		return this.animation_over;
	};

	linearInterpolation (min, max, t) {
		let passed = t / this.duration;
		if (t > this.duration) //interpolation over
			return max;
		else
			return (1 - passed) * min + t * max;
	}
};
