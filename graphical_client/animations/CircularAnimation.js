var DEGREE_TO_RAD = Math.PI / 180;
/**
 * @implements Animation
 * @class
 * @classdesc Represents a circular animation
 * @member {float} linear_speed The linear speed of the animation
 * @member {float} center_x The X coordinate of the center of rotation
 * @member {float} center_y The Y coordinate of the center of rotation
 * @member {float} center_z The Z coordinate of the center of rotation
 * @member {float} radius The radius of the animation
 * @member {float} startang The start angle of the animation, in degrees
 * @member {float} rotang The number of degrees to rotate
 * @member {bool} loop Whether the animation should loop or not
 * @member {float} reset_x The reset value in X (used to translate before the rotation)
 * @member {float} reset_y The reset value in Y (used to translate before the rotation)
 */
class CircularAnimation extends Animation {
	/**
	 * @memberof CircularAnimation
	 * @constructor
	 * @description Constructor of {@link CircularAnimation}
	 * @param {float} speed Linear speed of the animation
	 * @param {Array<float>} args Remaining arguments [centerx, centery, centerz, radius, startang, rotang]
	 */
	constructor(speed, args) {
		super(speed, args);
		this.linear_speed = speed;
		this.center_x = args[0];
		this.center_y = args[1];
		this.center_z = args[2];
		this.radius 	=	args[3];
		this.startang = args[4];
		this.rotang 	= args[5];
		this.loop			= args[6];

    this.reset_x = (this.radius * Math.sin(this.startang));
    this.reset_z = (this.radius * Math.cos(this.startang));
	}

	/**
	 * @override
	 * @memberof CircularAnimation
	 * @description Applies the animation to the matrix
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} delta Time, in seconds, passed since last function call
	 * @param {Array<Array<float>>} matrix The transformation matrix to apply the animation
	 */
	updateMatrix(assigned_index, delta, matrix) {
    if (!super.animationOver(assigned_index)) {
      this.calcIntermediateMatrix(assigned_index, delta, matrix);
    }
    else {
      this.calcEndMatrix(matrix);
    }
	}

	/**
	 * @memberof CircularAnimation
	 * @description Computes the intermediate transformation matrix
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} delta Time, in seconds, passed since last function call
	 * @param {Array<Array<float>>} matrix The transformation matrix to apply the animation
	 */
  calcIntermediateMatrix(assigned_index, delta, matrix) {
    super.incTotalTime(assigned_index, delta);
    let angle = super.linearInterpolation(assigned_index, this.startang, this.rotang, this.getTotalTime(assigned_index));

		mat4.translate(matrix, matrix, [this.reset_x, 0, this.reset_z]);
    mat4.rotateY	(matrix, matrix, angle*DEGREE_TO_RAD);
		mat4.translate(matrix, matrix, [-this.reset_x, 0, -this.reset_z]);

    if (!this.loop && super.checkAnimationOver(assigned_index)){
      super.setAnimationOver(assigned_index);
    }
  }

	/**
	 * @memberof CircularAnimation
	 * @description Computes the end transformation matrix
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} delta Time, in seconds, passed since last function call
	 * @param {Array<Array<float>>} matrix The transformation matrix to apply the animation
	 */
  calcEndMatrix(matrix) {
		mat4.translate(matrix, matrix, [this.reset_x, 0, this.reset_z]);
    mat4.rotateY	(matrix, matrix, this.rotang*DEGREE_TO_RAD);
		mat4.translate(matrix, matrix, [-this.reset_x, 0, -this.reset_z]);
  }

	/**
	 * @override
	 * @memberof CircularAnimation
	 * @description Gets the type of the animation
	 * @return {String} The name of the animation
	 * */
	get getType() {
		return "CircularAnimation";
	}

	/**
	 * @override
	 * @memberof CircularAnimation
	 * @description Assigns an index in the progression variables to the calling node
	 * @return {int} Index assigned
	 */
	assignIndex () {
		let assigned_index = this.animations_over.length;
		this.animations_over.push(false);
		this.durations.push(this.calculateDuration());
		this.total_time.push(0);

		return assigned_index;
	}

	/**
	 * @override
	 * @memberof CircularAnimation
	 * @description Calculates the total duration of the animation
	 * @return {float} The total duration of the animation
	 */
	calculateDuration () {
		let end = this.rotang * DEGREE_TO_RAD;
		return Math.abs(end*this.radius/this.speed);
	}
};
