var DEGREE_TO_RAD = Math.PI / 180;

/**
 * @implements Animation
 * @class
 * @classdesc Represents a circular animation
 * @member {Array<Array<float>>} pts The control points of the linear animation
 * @member {Array<int>} indexes The different start point indexes of the nodes
 * @member {Arrayz<float>} angles The angles between the linear segments
 */
class LinearAnimation extends Animation {

	/**
	 * @memberof LinearAnimation
	 * @constructor
	 * @description Constructor of {@link LinearAnimation}
	 * @param {float} speed Linear speed of the animation
	 * @param {Array<Array<float>>} args The control points of the animation
	 */
	constructor(speed, args) {
		super(speed, args);
    this.last_pt = args[args.length-1];
		this.pts = args;
		this.indexes = []; //indexes of the begin point
    this.angles = [];
    this.angles.push(0);

		let total_ang = 0;
    for (let i = 1; i < (this.pts.length-1); i++) {
      let vec1 = [this.pts[i][0] - this.pts[i-1][0], 0, this.pts[i][2] - this.pts[i-1][2]], //first segment vector
          vec2 = [this.pts[i+1][0] - this.pts[i][0], 0, this.pts[i+1][2] - this.pts[i][2]]; //second segment vector

			super.normalizeVector(vec1); super.normalizeVector(vec2);

			let dt_prod  = super.dotProduct(vec2, vec1),
					cross = super.crossProduct(vec2, vec1);
			total_ang += Math.atan2( super.dotProduct(cross, [0,1,0]), dt_prod);

			console.log("VEC1 = "+vec1+", VEC2 = "+vec2+"\nANGLE = "+(angle/DEGREE_TO_RAD)+"\n cross ="+cross+" dot = "+dt_prod);
			this.angles.push(total_ang);
    }
	}

	/**
	 * @override
	 * @memberof LinearAnimation
	 * @description Assigns an index in the progression variables to the calling node
	 * @return {int} Index assigned
	 */
	assignIndex() {
		let assigned_index = this.animations_over.length;
		this.indexes.push(0);
		this.total_time.push(0);
		this.animations_over.push(false);
		this.durations.push(this.calculateDuration(this.getBeginPt(assigned_index), this.getEndPt(assigned_index)))
		return assigned_index;
	}

	/**
	 * @override
	 * @memberof LinearAnimation
	 * @description Applies the animation to the matrix
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} delta Time passed, in seconds, since last function call
	 * @param {Array<Array<float>>} matrix The matrix to apply the animation
	 */
	updateMatrix (assigned_index, delta, matrix) {
    if (!super.animationOver(assigned_index)) {
      this.calcIntermediateMatrix(assigned_index, delta, matrix);
    }
    else {
      this.calcEndMatrix(assigned_index, matrix);
    }
	}

	/**
	 * @memberof LinearAnimation
	 * @description Computes an intermediate matrix of the animation
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} delta Time passed, in seconds, since last function call
	 * @param {Array<Array<float>>} matrix The matrix to apply the animation
	 */
  calcIntermediateMatrix(assigned_index, delta, matrix) {
    super.incTotalTime(assigned_index, delta);
    let init_pt = this.getBeginPt(assigned_index),
        end_pt  = this.getEndPt(assigned_index),
				angle = this.angles[this.indexes[assigned_index]],
				time = this.getTotalTime(assigned_index),
        tx, ty, tz;

    tx = super.linearInterpolation(assigned_index, init_pt[0], end_pt[0], time);
    ty = super.linearInterpolation(assigned_index, init_pt[1], end_pt[1], time);
    tz = super.linearInterpolation(assigned_index, init_pt[2], end_pt[2], time);

    mat4.translate(matrix, matrix, [tx, ty, tz]);
    mat4.rotateY(matrix, matrix, angle);
    this.updatePts(assigned_index);
  }

	/**
	 * @memberof LinearAnimation
	 * @description Computes the end matrix of the animation
	 * @param {int} assigned_index The index assigned to the node
	 * @param {Array<Array<float>>} matrix The matrix to apply the animation
	 */
  calcEndMatrix(assigned_index, matrix) {
    let end_pt = this.getEndPt(assigned_index),
				angle = this.angles[this.indexes[assigned_index]];

    mat4.translate(matrix, matrix, end_pt);
    mat4.rotateY(matrix, matrix, angle);
  }

	/**
	 * @memberof LinearAnimation
	 * @description Checks if the current segment has ended
	 * @param {int} assigned_index The index assigned to the node
	 * @return {int} 1 -> its the end point, 0 -> not the end point, -1 -> animation over
	 */
	checkNewEndPt(assigned_index) {
		if (super.checkAnimationOver(assigned_index)) {
			if (this.indexes[assigned_index] < (this.pts.length-2)) { // there are still more points
				return 1;
			}
			else { //animation over
				return -1;
			}
		}
		else //current end point not reached
			return 0;
	}

	/**
	 * @memberof LinearAnimation
	 * @description Checks if there is a need to update the {@link indexes} and if so does it
	 * @param {int} assigned_index The index assigned to the node
	 */
	updatePts (assigned_index) {
		let ret = this.checkNewEndPt(assigned_index);

		if (1 === ret) { //next segment
			this.indexes[assigned_index]++;
			this.durations[assigned_index] = this.calculateDuration(this.getBeginPt(assigned_index), this.getEndPt(assigned_index));
      super.resetTotalTime(assigned_index);
		}
		else if (-1 === ret) { //animation over
			super.setAnimationOver(assigned_index);
		}
	}

	/**
	 * @override
	 * @memberof LinearAnimation
	 * @description Calculates the duration of a single segment
	 * @param {Array<float>} pt1 Begin point
	 * @param {Array<float>} pt2 End point
	 * @return {float} The total duration of the segment
	 */
	calculateDuration (pt1, pt2) {
		return this.ptsDistance(pt1, pt2) / this.speed;
	};

	/**
	 * @override
	 * @memberof LinearAnimation
	 * @description Gets the type of the animation
	 * @return {String} The name of the animation
	 */
	get getType () {
		return "LinearAnimation";
	}

	/**
	 * @memberof LinearAnimation
	 * @description Gets the end point of the current segment
	 * @param {int} assigned_index The index assigned to the node
	 * @return {Array<int>} the begin point of the animation
	 */
	getBeginPt (assigned_index) {
		return this.pts[this.indexes[assigned_index]];
	}

	/**
	 * @memberof LinearAnimation
	 * @description Gets the end point of the current segment
	 * @param {int} assigned_index The index assigned to the node
	 * @return {Array<int>} the end point of the animation
	 */
	getEndPt (assigned_index) {
		return this.pts[this.indexes[assigned_index]+1];
	}

	/**
	 * @memberof LinearAnimation
	 * @description Calculates the linear distance between points
	 * @param {Array<float>} pt1 First point
	 * @param {Array<float>} pt2 Second point
	 * @return {float} The distance between the points
	 */
	ptsDistance(pt1, pt2) {
		return Math.sqrt(Math.pow(pt1[0]-pt2[0], 2) + Math.pow(pt1[1]-pt2[1], 2) + Math.pow(pt1[2]-pt2[2], 2));
	};
};
