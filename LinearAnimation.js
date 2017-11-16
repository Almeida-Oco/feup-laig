/**
 * @constructor
 * @param id ID of the animation
 * @param speed Speed of the animation
 * @param args Arguments of animation [[x,y,z],[x1,y1,z1] (...)]
 */
class LinearAnimation extends Animation {
	constructor(speed, args) {
		super(speed, args);
		this.pts = args;
		this.indexes = []; //indexes of the begin point
	}

	assignIndex() {
		let assigned_index = this.animations_over.length;
		this.indexes.push(0);
		this.total_time.push(0);
		this.animations_over.push(false);
		this.durations.push(this.calculateDuration(this.getBeginPt(assigned_index), this.getEndPt(assigned_index)));
		return assigned_index;
	}

	//TODO Check time units
	//TODO Add rotation
	/**
	 * @description Updates the position of the object
	 * @param curr_pos Current position of the object
	 * @return The new position of the object
	 */
	updateMatrix (assigned_index, delta, matrix) {
		delta /= 1000;
		let init_pt = this.getBeginPt(assigned_index),
				end_pt  = this.getEndPt(assigned_index),
				tx, ty, tz;
		super.incTotalTime(assigned_index, delta);
		tx = super.linearInterpolation(assigned_index, init_pt[0], end_pt[0], delta) - init_pt[0];
		ty = super.linearInterpolation(assigned_index, init_pt[1], end_pt[1], delta) - init_pt[1];
		tz = super.linearInterpolation(assigned_index, init_pt[2], end_pt[2], delta) - init_pt[2];
		mat4.translate(matrix, matrix, [tx, ty, tz]);

		this.updatePts(assigned_index);
		return matrix;
	}


	/**
	 * @description Checks if the new point of the object is an end point
	 * @param new_point Newest point of object [x,y,z]
	 * @return 1 If it is the end point and the end point should be updated, 0 if it is not, -1 if animation over
	 */
	checkNewEndPt(assigned_index) {
		if (super.getTotalTime(assigned_index) >= super.getDuration(assigned_index)) {
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
