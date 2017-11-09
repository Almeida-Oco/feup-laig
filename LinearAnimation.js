/**
 * @constructor
 * @param id ID of the animation
 * @param speed Speed of the animation
 * @param args Arguments of animation [[x,y,z],[x1,y1,z1] (...)]
 */
class LinearAnimation extends Animation {
	constructor(speed, args) {
		super();

		this.pts = args;
		this.pt_i = 0;
		this.curr_end_pt = args[this.pt_i];
		this.pt_i ++;
		this.init_pos = [0,0,0];
		console.log("TIME = "+this.start_time);
		// 1unit / s
		this.speed = speed;
	}

	/**
	 * @description Checks if the new point of the object is an end point
	 * @param new_point Newest point of object [x,y,z]
	 * @return 1 If it is the end point and the end point should be updated, 0 if it is not, -1 if animation over
	 */
	checkNewEndPt(new_point) {
		//if new point is equal to current end point
		if (new_point[0] == this.curr_end_pt[0] &&
				new_point[1] == this.curr_end_pt[1] &&
				new_point[2] == this.curr_end_pt[2])
		{
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
		if (!this.animation_over) {
			let init_x = this.init_pos[0], init_y = this.init_pos[1], init_z = this.init_pos[2],
					end_x = this.curr_end_pt[0], end_y = this.curr_end_pt[1], end_z = this.curr_end_pt[2],
					distance = this.speed * delta,
					distance_to_end_pt = Math.sqrt( Math.pow(init_x - end_x,2) + Math.pow(init_y - end_y, 2) + Math.pow(init_z - end_z, 2) ),
					t_x, t_y, t_z;

			if (distance > distance_to_end_pt)
				distance = distance_to_end_pt;

			t_x = distance * Math.cos(this.curr_end_pt[0]);
			t_y = distance * Math.cos(this.curr_end_pt[1]);
			t_z = distance * Math.cos(this.curr_end_pt[2]);

			mat4.translate(transformation_matrix, transformation_matrix, [t_x, t_y, t_z]);

			let new_point = this.checkNewEndPt([t_x, t_y, t_z]);
			if (1 == new_point)
				this.curr_end_pt = this.args[this.pt_i++];
			else if (-1 == new_point)
				this.animation_over = true;

		}

		return transformation_matrix;
	}

	get getType() {
		return "LinearAnimation";
	}

};

LinearAnimation.prototype.getCurrentTime() = Animation;
