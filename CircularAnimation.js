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

		this.curr_angle = [];
	}

	updateMatrix(assigned_index, delta, matrix) {
		delta /= 1000;
		let start_angle = this.getCurrAngle(assigned_index),
				angle, reset_x, reset_z;
		super.incTotalTime(assigned_index, delta);
		console.log("Total = "+super.getTotalTime(assigned_index)+", Duration ="+super.getDuration(assigned_index));

		reset_x = (this.radius * Math.cos(start_angle)) + this.center_x;
		reset_z = (this.radius * Math.sin(start_angle)) + this.center_z;
		angle = super.linearInterpolation(assigned_index, start_angle, this.rotang, delta) - start_angle;

		mat4.translate(matrix, matrix, [reset_x, 0, reset_z]);
		mat4.rotate		(matrix, matrix, angle*DEGREE_TO_RAD, [0,1,0]);
		mat4.translate(matrix, matrix, [-reset_x, 0, -reset_z]);

		if (this.checkAnimationOver(assigned_index)) {
			super.setAnimationOver(assigned_index);
		}

		return matrix;
	}

	checkAnimationOver (assigned_index) {
		return (super.getTotalTime(assigned_index) >= super.getDuration(assigned_index));
	}

	get getType() {
		return "CircularAnimation";
	}

	getCurrAngle (assigned_index) {
		return this.curr_angle[assigned_index];
	}

	assignIndex () {
		let assigned_index = this.animations_over.length;
		this.animations_over.push(false);
		this.durations.push(this.calculateDuration());
		this.total_time.push(0);
		this.curr_angle.push(this.startang);

		return assigned_index;
	}

	calculateDuration () {
		let end = this.rotang * DEGREE_TO_RAD, begin = this.startang * DEGREE_TO_RAD;
		return (end - begin)*this.radius/this.speed;
	}
};
