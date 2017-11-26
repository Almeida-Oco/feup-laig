/**
 * @constructor
 * @param args The animations inside the combo
 */
class ComboAnimation extends Animation {
	constructor(args) {
		super(0, args);
		this.animations = [];
		this.animations_id = args;
		this.assigned_indexes = [];
	}

	updateMatrix(assigned_index, delta, matrix) {
		if (!super.animationOver(assigned_index)) {
			this.calcIntermediateMatrix(assigned_index, delta, matrix);
		}
		else {
			this.calcEndMatrix(assigned_index, delta, matrix);
		}
	}

	calcIntermediateMatrix(assigned_index, delta, matrix) {
		let indexes = this.assigned_indexes[assigned_index];
		for (let i = 0; i < this.animations.length; i++) {
			let index = indexes[i];
			this.animations[i].updateMatrix(index, delta, matrix);

			if (!this.animations[i].animationOver(assigned_index)){ //stop at first successful animation
				return;
			}
		}
		//if it gets here it means that the full animation was done
		super.setAnimationOver(assigned_index);
	}

	calcEndMatrix(assigned_index, delta, matrix) {
		let indexes = this.assigned_indexes[assigned_index];
		for (let i = 0; i < this.animations.length; i++) {
			let index = indexes[i];
			this.animations[i].updateMatrix(index, delta, matrix);
		}
	}

	calculateDuration () {
		console.log("MEOW");
	}

	setAnimations(animations) {
		for (let i = 0; i < this.animations_id.length; i++) {
			this.animations.push(animations.get(this.animations_id[i]));
		}
	}

	assignIndex () {
		let ret = this.assigned_indexes.length;
		this.assigned_indexes.push([]);
		for (let i = 0; i < this.animations.length; i++) {
			this.assigned_indexes[ret].push(this.animations[i].assignIndex());
		}
		return ret;
	}

	getType() {
		return "ComboAnimation";
	}
};
