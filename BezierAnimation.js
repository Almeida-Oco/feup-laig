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
		this.prev_pts = [];
	}

	updateMatrix(assigned_index, delta, matrix) {
		let bezier_x, bezier_y, bezier_z;
		super.incTotalTime(assigned_index, delta);
		bezier_x = this.getPoint(assigned_index, this.getCoordinate(0)) - this.prev_pts[assigned_index][0];
		bezier_y = this.getPoint(assigned_index, this.getCoordinate(1)) - this.prev_pts[assigned_index][1];
		bezier_z = this.getPoint(assigned_index, this.getCoordinate(2)) - this.prev_pts[assigned_index][2];

		this.prev_pts = [bezier_x, bezier_y, bezier_z];
		mat4.translate(matrix, matrix, [bezier_x, bezier_y, bezier_z]);

		return matrix;
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
		this.prev_pts.push([0,0,0]);
		this.durations.push(this.deCasteljau(1) / this.speed);
		
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

	/**
	 * @description Gets the given coordinate
	 * @param coordinate Coordinate to return (0 -> X, 1 -> Y, 2 -> Z)
	 * @return A vector with the 4 coordinates
	 */
	getCoordinate (coordinate) {
		return [this.pts[0][coordinate], this.pts[1][coordinate], this.pts[2][coordinate], this.pts[3][coordinate]];
	}

	deCasteljau (depth) {
		let base_pts = [], mid_pts  = []; //3 Nested arrays
		base_pts[0] = [this.pts[0], this.pts[1], this.pts[2], this.pts[3]];
		updateMidPts(base_pts, mid_pts, 0);

		for (let i = 0 ; i < depth ; i++) {
			updateBasePts(base_pts, mid_pts, index);
			for (let index = 0; index < base_pts.length; index++) {
				updateMidPts(base_pts[index], mid_pts[index]);
			}
		}

		let total_distance = 0;
		for (let pts in mid_pts) {
			total_distance += calcSegmentLength(pts);
		}

		return total_distance;
	}

	calcMiddlePoint (pt1, pt2) {
		return [(pt2[0] + pt1[0]) / 2 , (pt2[1] + pt1[1]) / 2, (pt2[2] + pt1[2]) / 2];
	}

	/**
	 * @description Calculates the given segment total distance
	 * @param pts Array of arrays that contain the 4 points of the segment
	 * @return The total length of the segment
	 */
	calcSegmentLength (pts) {
		let dist1 = Math.sqrt(Math.pow((pts[0][0]+pts[1][0]), 2) + Math.pow((pts[0][1]+pts[1][1]), 2) + Math.pow((pts[0][2]+pts[1][2]), 2)),
				dist2 = Math.sqrt(Math.pow((pts[1][0]+pts[2][0]), 2) + Math.pow((pts[1][1]+pts[2][1]), 2) + Math.pow((pts[1][2]+pts[2][2]), 2)),
				dist3 = Math.sqrt(Math.pow((pts[2][0]+pts[3][0]), 2) + Math.pow((pts[2][1]+pts[3][1]), 2) + Math.pow((pts[2][2]+pts[3][2]), 2));

		return dist1 +  dist2 + dist3;
	}

	/**
	 * @description Updates the mid points of casteljau algorithm
	 * @param base_pts 3 Nested arrays that correspond to the curve, then the points, then the xyz coordinates
	 * @param mid_pts 3 Nestes arrays that correspond to the curvee, then the mid points, then the xyz coordinates
	 * @param index Index to store the update
	 */
	updateMidPts (base_pts, mid_pts, index) {
		let temp_pt = calcMiddlePoint(base_pts[index][1], base_pts[index][2]);

		mid_pts[index][0] = base_pts[index][0];
		mid_pts[index][1] = calcMiddlePoint(base_pts[index][0],	base_pts[index][1]);
		mid_pts[index][2] = calcMiddlePoint(mid_pts[index][1], temp_pt);

		mid_pts[index+1][0] = base_pts[index][3];
		mid_pts[index+1][1] = calcMiddlePoint(base_pts[index][3], base_pts[index][2]);
		mid_pts[index+1][2] = calcMiddlePoint(mid_pts[index+1][1], temp_pt);

		//Common point (M)
		mid_pts[index+1][3] = calcMiddlePoint(mid_pts[index][2], mid_pts[index+1][2]);
		mid_pts[index][3] = mid_pts[index+1][3];
	}

	/**
	 * @description Updates the base points for the casteljau algorithm
	 * @param base_pts 3 Nested arrays that correspond to the curve, then the points, then the xyz coordinates
	 * @param mid_pts 3 Nestes arrays that correspond to the curvee, then the mid points, then the xyz coordinates
	 * @param index Index to store the update
	 */
	updateBasePts (base_pts, mid_pts, index) {
		base_pts[index][0] = mid_pts[index][0];
		base_pts[index][1] = mid_pts[index][1];
		base_pts[index][2] = mid_pts[index][4];
		base_pts[index][3] = mid_pts[index][6];

		base_pts[index+1][0] = mid_pts[index][6];
		base_pts[index+1][1] = mid_pts[index][5];
		base_pts[index+1][2] = mid_pts[index][3];
		base_pts[index+1][3] = mid_pts[index][7];
	}
};
