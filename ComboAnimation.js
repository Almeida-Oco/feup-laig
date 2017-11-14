/**
 * @constructor
 * @param args The animations inside the combo
 */
class ComboAnimation extends Animation {
	constructor(args) {
		super(0, args);
		this.animations = [];
		this.animations_id = args;
	}

	updateMatrix(delta, matrix) {
		for (let i = 0; i < this.animations.length; i++) {
			if (!this.animations[i].animationOver()) {
				matrix = this.animations[i].updateMatrix(delta, matrix);
				break;
			}
			else{
				continue;
			}
		}

		return matrix;
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
