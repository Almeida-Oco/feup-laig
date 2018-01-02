var DEGREE_TO_RAD = Math.PI / 180;

/**
 * @implements Animation
 * @class
 * @classdesc Represents a bezier animation
 * @member {Array<Array<float>>} pts The control points of the animation
 */
class BezierAnimation extends Animation {

	/**
	 * @override
	 * @constructor
	 * @memberof BezierAnimation
	 * @description Constructor of {@link BezierAnimation}
	 * @param {float} speed The speed of the animation
	 * @param {Array<Array<float>>} args Arguments of animation [[x,y,z],[x1,y1,z1] (...)]
	 */
	constructor(speed, args) {
		super(speed, args);
    this.last_pt = [args[3][0]-args[0][0], args[3][1]-args[0][1], args[3][2] - args[0][2]];
		this.pts = args;
		this.speed = speed;
	}

	/**
	 * @override
	 * @memberof BezierAnimation
	 * @description Assigns an index in the progression variables to the calling node
	 * @return {int} Index assigned
	 */
	assignIndex () {
		let ret = this.animations_over.length;
		this.animations_over.push(false);
		this.total_time.push(0);
		this.durations.push(this.calculateDuration(8)/this.speed);

		return ret;
	}

	/**
	 * @override
	 * @memberof BezierAnimation
	 * @description Applies the animation to the matrix
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} delta Time passed, in seconds, since last function call
	 * @param {Array<Array<float>>} matrix The matrix to apply the animation
	 */
	updateMatrix(assigned_index, delta, matrix) {
    if (!super.animationOver(assigned_index)) {
			this.calcIntermediateMatrix(assigned_index, delta, matrix);
    }
		else {
			this.calcEndMatrix(assigned_index, matrix);
		}
	}

	/**
	 * @memberof BezierAnimation
	 * @description Computes an intermediate matrix of the animation
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} delta Time passed, in seconds, since last function call
	 * @param {Array<Array<float>>} matrix The matrix to apply the animation
	 */
	calcIntermediateMatrix(assigned_index, delta, matrix) {
		super.incTotalTime(assigned_index, delta);
		let bezier_x = this.getPoint(assigned_index, this.getCoordinate(0)) - this.pts[0][0],
				bezier_y = this.getPoint(assigned_index, this.getCoordinate(1)) - this.pts[0][1],
				bezier_z = this.getPoint(assigned_index, this.getCoordinate(2)) - this.pts[0][2];

		mat4.translate(matrix, matrix, [bezier_x, bezier_y, bezier_z]);
		this.calcRotation(assigned_index, matrix);

		if (super.checkAnimationOver(assigned_index)){
			super.setAnimationOver(assigned_index);
		}
	}

	/**
	 * @memberof BezierAnimation
	 * @description Computes the end matrix of the animation
	 * @param {int} assigned_index The index assigned to the node
	 * @param {Array<Array<float>>} matrix The matrix to apply the animation
	 */
	calcEndMatrix(assigned_index, matrix) {
		mat4.translate(matrix, matrix, this.last_pt);
		this.calcRotation(assigned_index, matrix);
	}

	/**
	 * @override
	 * @memberof BezierAnimation
	 * @description Computes the rotation to apply to the object
	 * @param {int} assigned_index The index assigned to the node
	 * @param {Array<Array<float>>} matrix The matrix to apply the rotation
	 */
	calcRotation(assigned_index, matrix) {
		let rot_x = this.getTan(assigned_index, this.getCoordinate(0)),
				rot_z = this.getTan(assigned_index, this.getCoordinate(2));

		let angle = -Math.atan2(rot_x, rot_z);

		mat4.rotateY(matrix, matrix, angle);
	}

	/**
	 * @memberof BezierAnimation
	 * @description Gets the point interpolated through bezier formula
	 * @param {int} assigned_index The index assigned to the node
	 * @param {Array<float>} vars The array with the 4 X, Y or Z coordinates of the bezier control points
	 * @return {float} The interpolated X, Y or Z coordinate
	 */
	getPoint (assigned_index, vars) {
		let time = super.getTotalTime(assigned_index),
				perc = (time/super.getDuration(assigned_index));
		if (perc > 1)
			perc = 1;

		let param1 = Math.pow((1-perc), 3)*vars[0],
				param2 = 3 * perc * Math.pow((1-perc), 2)*vars[1],
				param3 = 3 * Math.pow(perc, 2) * (1-perc)*vars[2],
				param4 = Math.pow(perc, 3)*vars[3];

		return (param1+param2+param3+param4);
	}

	/**
	 * @memberof BezierAnimation
	 * @description Gets the tangent interpolated through bezier formula
	 * @param {int} assigned_index The index assigned to the node
	 * @param {Array<float>} vars The array with the 4 X, Y or Z coordinates of the bezier control points
	 * @return {float} The interpolated X, Y or Z tangent coordinate
	 * */
	getTan (assigned_index, vars) {
		let time = super.getTotalTime(assigned_index),
				perc = (time/super.getDuration(assigned_index));
		if (perc > 1)
			perc = 1;

		let param1 = 3 * Math.pow((1-perc), 2) * vars[0],
				param2 = 6 * perc * Math.pow((1-perc), 2) * vars[1],
				param3 = 6 * Math.pow(perc, 2) * (1-perc) * vars[2],
				param4 = 3 * Math.pow(perc, 2) * vars[3];

		return (param1 + param2 + param3 + param4);
	}

	/**
	 * @memberof BezierAnimation
	 * @description Gets the given coordinate
	 * @param {int} coordinate Coordinate to return (0 -> X, 1 -> Y, 2 -> Z)
	 * @return {Array<float>} An array with the 4 X, Y or Z coordinates
	 */
	getCoordinate (coordinate) {
		return [this.pts[0][coordinate], this.pts[1][coordinate], this.pts[2][coordinate], this.pts[3][coordinate]];
	}

	/**
	 * @override
	 * @memberof BezierAnimation
	 * @description Gets the type of the animation
	 * @return {String} The name of the animation
	 */
	get getType() {
		return "BezierAnimation";
	}

	/**
	 * @override
	 * @memberof BezierAnimation
	 * @description Calculates the total duration of the animation
	 * @param {int} depth How many subdivisions to use
	 * @return {float} The total duration of the animation based on {@link speed}
	 */
	calculateDuration (depth) {
		return this.deCasteljau(depth);
	}


	// ---------------------- BEGIN DE CASTELJAU ----------------------

	/**
	 * @private
	 * @memberof BezierAnimation
	 * @description Calculates the length of the bezier curve based on De Casteljau algorithm
	 * @param {int} depth Number of sudivisions to do (Higher means more precision) recommended = 8
	 * @return {float} Length of bezier curve
	 */
	deCasteljau (depth) {
		let arrs = this.initializeArrays(depth),
				base_pts = arrs[0], mid_pts = arrs[1];
		base_pts[0] = [this.pts[0], this.pts[1], this.pts[2], this.pts[3]];
		this.updateMidPts(base_pts, mid_pts, 0);

		for (let i = 1 ; i < depth ; i++) {
			this.updateBasePts(base_pts, mid_pts);
			for (let index = 0; (index < base_pts.length && base_pts[index][0].length > 0); index++) {
				this.updateMidPts(base_pts, mid_pts, index*2);
			}
		}

		let total_distance = 0;
		for (let mid_i = 0; mid_i < mid_pts.length; mid_i++) {
			total_distance += this.calcSegmentLength(mid_pts[mid_i]);
		}

		return total_distance;
	}

	/**
	 * @memberof BezierAnimation
	 * @description Calculates the middle point between two points, can be any dimension
	 * @param {Array<float>} pt1 Point 1
	 * @param {Array<float>} pt2 Point 2
	 * @return {Array<float>} The moddle point
	 */
	calcMiddlePoint (pt1, pt2) {
		let ret = [];
		if (pt1.length != pt2.length)
			return -1;

		for (let i = 0; i < pt1.length; i++)
			ret.push((pt1[i]+pt2[i])/2);

		return ret;
	}

	/**
	 * @memberof BezierAnimation
	 * @description Calculates the given segment linear length
	 * @param {Array<float>} pts Array of arrays that contain the 4 points of the segment
	 * @return {float} The total length of the segment
	 */
	calcSegmentLength (pts) {
		let dist1 = Math.sqrt(Math.pow((pts[0][0]-pts[1][0]), 2) + Math.pow((pts[0][1]-pts[1][1]), 2) + Math.pow((pts[0][2]-pts[1][2]), 2)),
				dist2 = Math.sqrt(Math.pow((pts[1][0]-pts[2][0]), 2) + Math.pow((pts[1][1]-pts[2][1]), 2) + Math.pow((pts[1][2]-pts[2][2]), 2)),
				dist3 = Math.sqrt(Math.pow((pts[2][0]-pts[3][0]), 2) + Math.pow((pts[2][1]-pts[3][1]), 2) + Math.pow((pts[2][2]-pts[3][2]), 2));

		return dist1 +  dist2 + dist3;
	}

	/**
	 * @memberof BezierAnimation
	 * @description Updates the mid points of casteljau algorithm, return value in {@link mid_pts}
	 * @param {Array<Array<Array<float>>>} base_pts Points of the algorithm, 1st depth -> curve, 2nd depth -> points, 3rd depth -> xyz coordinates
	 * @param {Array<Array<Array<float>>>} mid_pts  Points of the algorithm, 1st depth -> curve, 2nd depth -> mid points, 3rd depth -> xyz coordinates
	 */
	updateMidPts (base_pts, mid_pts, index) {
		let temp_pt = this.calcMiddlePoint(base_pts[index/2][1], base_pts[index/2][2]);

		mid_pts[index][0] = base_pts[index/2][0];
		mid_pts[index][1] = this.calcMiddlePoint(base_pts[index/2][0],	base_pts[index/2][1]);
		mid_pts[index][2] = this.calcMiddlePoint(mid_pts[index][1], temp_pt);

		mid_pts[index+1][0] = base_pts[index/2][3];
		mid_pts[index+1][1] = this.calcMiddlePoint(base_pts[index/2][3], base_pts[index/2][2]);
		mid_pts[index+1][2] = this.calcMiddlePoint(mid_pts[index+1][1], temp_pt);

		//Common point (M)
		mid_pts[index+1][3] = this.calcMiddlePoint(mid_pts[index][2], mid_pts[index+1][2]);
		mid_pts[index][3] = mid_pts[index+1][3];
	}

	/**
	 * @memberof BezierAnimation
	 * @description Updates the base points for the casteljau algorithm, return value in {@link base_pts}
	 * @param {Array<Array<Array<float>>>} base_pts Points of the algorithm, 1st depth -> curve, 2nd depth -> points, 3rd depth -> xyz coordinates
	 * @param {Array<Array<Array<float>>>} mid_pts  Points of the algorithm, 1st depth -> curve, 2nd depth -> mid points, 3rd depth -> xyz coordinates
	 */
	updateBasePts (base_pts, mid_pts) {
		for (let i = 0; i < mid_pts.length; i++) {
			for (let j = 0; (j < mid_pts[i].length && mid_pts[i][0].length > 0); j++) {
				base_pts[i][j] = mid_pts[i][j];
			}
		}
	}

	/**
	 * @memberof BezierAnimation
	 * @description Initializes the needed arrays for the De Casteljau algorithm
	 * @param {int} depth Number of subdivisions to do
	 * @return <Array<Array<Array<Array<float>>>> Array containing: [<base_points>, <subdivided_points>]
	 */
	initializeArrays (depth) {
		let base = [], mid = [];
		let max_base = Math.pow(2, depth-1) * 2, max_mid = Math.pow(2, depth) * 2;
		for (let i = 0; i < max_base; i++) {
			base[i] = [];
			mid[i] = [];
			for (let j = 0; j < 4; j++) {
				base[i][j] = [];
				mid[i][j] = [];
			}
		}
		return [base, mid];
	}

	// ---------------------- END DE CASTELJAU ----------------------
};
