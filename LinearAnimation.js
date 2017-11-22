var DEGREE_TO_RAD = Math.PI / 180;

/**
 * @constructor
 * @param id ID of the animation
 * @param speed Speed of the animation
 * @param args Arguments of animation [[x,y,z],[x1,y1,z1] (...)]
 */
class LinearAnimation extends Animation {
	constructor(speed, args) {
		super(speed, args);
    this.last_pt = args[args.length-1];
		this.pts = args;
		this.indexes = []; //indexes of the begin point
    this.angles = [];
    this.angles.push(0);
    for (let i = 1; i < (this.pts.length-1); i++) {
      let diff_x1 = this.pts[i][0] - this.pts[i-1][0], diff_x2 = this.pts[i+1][0] - this.pts[i][0],
          diff_z1 = this.pts[i][2] - this.pts[i-1][2], diff_z2 = this.pts[i+1][2] - this.pts[i][2];
      this.angles.push(Math.atan2((diff_z2-diff_z1), (diff_x2-diff_x1)));
    }
	}

	assignIndex() {
		let assigned_index = this.animations_over.length;
		this.indexes.push(0);
		this.total_time.push(0);
		this.animations_over.push(false);
		this.durations.push(this.calculateDuration(this.getBeginPt(assigned_index), this.getEndPt(assigned_index)))
		return assigned_index;
	}

	/**
	 * @description Updates the position of the object
	 * @param curr_pos Current position of the object
	 * @return The new position of the object
	 */
	updateMatrix (assigned_index, delta, matrix) {
    if (!super.animationOver(assigned_index)) {
      this.calcIntermediateMatrix(assigned_index, delta, matrix);
    }
    else {
      this.calcEndMatrix(assigned_index, matrix);
    }
	}

  calcIntermediateMatrix(assigned_index, delta, matrix) {
    super.incTotalTime(assigned_index, delta);
    let init_pt = this.getBeginPt(assigned_index),
        end_pt  = this.getEndPt(assigned_index),
        tx, ty, tz;

    tx = super.linearInterpolation(assigned_index, init_pt[0], end_pt[0], this.getTotalTime(assigned_index));
    ty = super.linearInterpolation(assigned_index, init_pt[1], end_pt[1], this.getTotalTime(assigned_index));
    tz = super.linearInterpolation(assigned_index, init_pt[2], end_pt[2], this.getTotalTime(assigned_index));

    mat4.translate(matrix, matrix, [tx, ty, tz]);
    mat4.rotateY(matrix, matrix, this.angles[this.indexes[assigned_index]]);
    this.updatePts(assigned_index);
  }

  calcEndMatrix(assigned_index, matrix) {
    let end_pt = this.getEndPt(assigned_index);

    mat4.translate(matrix, matrix, end_pt);
    mat4.rotateY(matrix, matrix, this.angles[this.indexes[assigned_index]]);
  }

	/**
	 * @description Checks if the new point of the object is an end point
	 * @param new_point Newest point of object [x,y,z]
	 * @return 1 If it is the end point and the end point should be updated, 0 if it is not, -1 if animation over
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

	calculateDuration (pt1, pt2) {
		return this.ptsDistance(pt1, pt2) / this.speed;
	};

	get getType () {
		return "LinearAnimation";
	}

	getBeginPt (assigned_index) {
		return this.pts[this.indexes[assigned_index]];
	}

	getEndPt (assigned_index) {
		return this.pts[this.indexes[assigned_index]+1];
	}

	ptsDistance(pt1, pt2) {
		return Math.sqrt(Math.pow(pt1[0]-pt2[0], 2) + Math.pow(pt1[1]-pt2[1], 2) + Math.pow(pt1[2]-pt2[2], 2));
	};
};
