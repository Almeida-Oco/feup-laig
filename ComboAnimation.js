/**
 * @constructor
 * @param args The animations inside the combo
 */
class ComboAnimation extends Animation {
	constructor(args) {
		super();
		this.animations = [];
		this.animations_id = args;
	}

	updateMatrix(transformation_matrix) {
		console.log("\n\n MEOW \n\n");
	}

	setAnimations(animations) {
		for (let i = 0; i < this.animations_id.length; i++) {
			this.animations.push(animations.get(this.animations_id[i]));
		}
	}

	getType() {
		return "ComboAnimation";
	}
};
