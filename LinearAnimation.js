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
		this.pt_i = 1;
		this.curr_end_pt = args[this.pt_i++];
		this.pt_i ++;
		this.init_pos = args[0];
	}

	/**
	 * @description Checks if the new point of the object is an end point
	 * @param new_point Newest point of object [x,y,z]
	 * @return 1 If it is the end point and the end point should be updated, 0 if it is not, -1 if animation over
	 */
	checkNewEndPt(new_point) {
		//if new point is equal to current end point
		if (this.total_time >= this.duration) {
			if (this.pt_i < this.pts.length) { // there are still more points
				this.init_pos = new_point;
				return 1;
			}
			else { //animation over
				return -1;
			}
		}
		else //current end point not reached
			return 0;
	}


	//TODO check if this is working
	/**
	 * @description Updates the position of the object
	 * @param curr_pos Current position of the object
	 * @return The new position of the object
	 */
	updateMatrix(delta, transformation_matrix) {
		//console.log(delta);
		delta = (delta*1.0)/10
		if (!this.animation_over) {
			let init_x = this.init_pos[0], init_y = this.init_pos[1], init_z = this.init_pos[2],
					end_x = this.curr_end_pt[0], end_y = this.curr_end_pt[1], end_z = this.curr_end_pt[2],
					tx, ty, tz;
			this.total_time += delta;
			tx = super.linearInterpolation(init_x, end_x, delta) - init_x;
			ty = super.linearInterpolation(init_y, end_y, delta) - init_y;
			tz = super.linearInterpolation(init_z, end_z, delta) - init_z;

			mat4.translate(transformation_matrix, transformation_matrix, [tx, ty, tz]);

			let new_point = this.checkNewEndPt([tx, ty, tz]);
			if (1 == new_point)
				this.curr_end_pt = this.args[this.pt_i++];
			else if (-1 == new_point){
				console.log("		ANIMATION OVER! 	\n");
				this.animation_over = true;
			}

			return transformation_matrix;
		}
		mat4.translate(transformation_matrix, transformation_matrix, [0,0,0]);
		return transformation_matrix;
	}

	get getType() {
		return "LinearAnimation";
	}

};
