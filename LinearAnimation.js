/**
 * @constructor
 * @param id ID of the animation
 * @param speed Speed of the animation
 * @param args Arguments of animation [[x,y,z],[x1,y1,z1] (...)]
 */
class LinearAnimation extends Animation {
	constructor(id, speed, args) {
		super();
		this.pts = args;
		this.curr_end_pt = args[0];

		// 1unit / s
		this.speed = speed;
		this.id = id;
	}

	tickTock(curr_pos) {
		if (this.old_time == 0) { //begin animation
			this.old_time = this.current_time.getTime();
			return curr_pos;
		}
		let x = curr_pos[0], y = curr_pos[1], z = curr_pos[2],
				end_x = this.curr_end_pt[0], end_y = this.curr_end_pt[1], end_z = this.curr_end_pt[2],
				sec = (this.current_time.getTime() - this.old_time) / 1000, //seconds passed
				distance = Math.sqrt(Math.pow(x-end_x,2) + Math.pow(y-end_y,2) + Math.pow(z-end_z,2)),
				new_x, new_y, new_z
		if (distance_to_pt > this.speed*sec)
			distance = this.speed * sec;

		new_x = x + distance * Math.cos( this.dotProduct([1,0,0], ))

		console.log("\n\n MEOW \n\n");
	}
};
