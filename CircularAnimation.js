var DEGREE_TO_RAD = Math.PI / 180;
/**
 * @constructor
 * @param id ID of the animation
 * @param speed Linear speed of the animation
 * @param args Remaining arguments [centerx, centery, centerz, radius, startang, rotang]
 */
class CircularAnimation extends Animation {
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

	updateMatrix(assigned_index, delta, matrix) {
    if (!super.animationOver(assigned_index)) {
      this.calcIntermediateMatrix(assigned_index, delta, matrix);
    }
    else {
      this.calcEndMatrix(matrix);
    }
	}

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

  calcEndMatrix(matrix) {
		mat4.translate(matrix, matrix, [this.reset_x, 0, this.reset_z]);
    mat4.rotateY	(matrix, matrix, this.rotang*DEGREE_TO_RAD);
		mat4.translate(matrix, matrix, [-this.reset_x, 0, -this.reset_z]);
  }

	get getType() {
		return "CircularAnimation";
	}

	assignIndex () {
		let assigned_index = this.animations_over.length;
		this.animations_over.push(false);
		this.durations.push(this.calculateDuration());
		this.total_time.push(0);

		return assigned_index;
	}

	calculateDuration () {
		let end = this.rotang * DEGREE_TO_RAD;
		return Math.abs(end*this.radius/this.speed);
	}
};
