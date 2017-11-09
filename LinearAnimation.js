/**
 * @constructor
 * @param id ID of the animation
 * @param speed Speed of the animation
 * @param args Arguments of animation [[x,y,z],[x1,y1,z1] (...)]
 */
class LinearAnimation extends Animation {
	constructor(speed, args) {
		super();

		this.animation_over = false;
		this.pts = args;
		this.pt_i = 0;
		this.curr_end_pt = args[this.pt_i++];

		// 1unit / s
		this.speed = speed;
	}

	//TODO check if this is working
	tickTock(curr_pos) {
		if (!this.animation_over){
			if (this.old_time == 0) { //begin animation
				this.old_time = this.current_time.getTime();
				return curr_pos;
			}
			let x = curr_pos[0], y = curr_pos[1], z = curr_pos[2],
					end_x = this.curr_end_pt[0], end_y = this.curr_end_pt[1], end_z = this.curr_end_pt[2],
					sec = (this.current_time.getTime() - this.old_time) / 1000, //seconds passed
					distance_to_pt = Math.sqrt(Math.pow(x-end_x,2) + Math.pow(y-end_y,2) + Math.pow(z-end_z,2)),
					new_x, new_y, new_z, distance;

			if (distance_to_pt > this.speed*sec)
				distance = this.speed * sec;
			else
				distance = distance_to_pt;

			new_x = x + distance * Math.cos( this.dotProduct([1,0,0], this.curr_end_pt));
			new_y = y + distance * Math.cos( this.dotProduct([0,1,0], this.curr_end_pt));
			new_z = z + distance * Math.cos( this.dotProduct([0,0,1], this.curr_end_pt));

			let new_point = checkNewEndPt([new_x, new_y, new_z]);
			if (1 == new_point)
				this.curr_end_pt = this.args[this.pt_i++];
			else if (-1 == new_point)
				this.animation_over = true;

			return [new_x, new_y, new_z];
		}

		return curr_pos;
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
			if (this.pt_i < this.args.length)
				return 1;
			else
				return -1;
		}
		else
			return 0;
	}

	get getType() {
		super.getType();
		return "LinearAnimation";
	}

};
