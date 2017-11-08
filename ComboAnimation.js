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

	tickTock() {
		console.log("\n\n MEOW \n\n");
	}

	set setAnimations(animations) {
		for (let i = 0; i < animations_id; i++)
			this.animations.push(animations[animations_id[i]]);
	}
};
