/**
 * @constructor
 * @param id ID of the animation
 * @param speed Linear speed of the animation
 * @param args Remaining arguments [centerx, centery, centerz, radius, startang, rotang]
 */
class CircularAnimation extends Animation {
	constructor(id, speed, args) {
		super();
		this.id = id;
		this.linear_speed = speed;
		this.center_x = args[0];
		this.center_y = args[1];
		this.center_z = args[2];
		this.radius 	=	args[3];
		this.startang = args[4];
		this.rotang 	= args[5];
	}

	tickTock() {
		console.log("\n\n MEOW \n\n");
	}
};
