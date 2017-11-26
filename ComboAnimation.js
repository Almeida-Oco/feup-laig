/**
 * @class
 * @implements Animation
 * @classdesc Represents a combo animation, similarly to {@link Animation} the progress variables are stored in arrays
 * @member {Array<Animation>} animation The animations of the combo animation
 * @member {<Array<String>>} animations_id The id of the animations
 * @member {Array<Array<int>>} assigned_indexes The indexes assigned by the various animations to the calling node
 */
class ComboAnimation extends Animation {

	/**
	 * @override
	 * @constructor
	 * @memberof ComboAnimation
	 * @description The constructor for the animation
	 * @param {Array<String>} args The arguments of the animation (the id's of the animations)
	 */
	constructor(args) {
		super(0, args);
		this.animations = [];
		this.animations_id = args;
		this.assigned_indexes = [];
	}

	/**
	 * @override
	 * @memberof BezierAnimation
	 * @description Applies the animation to the matrix
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} delta Time passed, in seconds, since last function call
	 * @param {Array<Array<float>>} matrix The matrix to apply the animation
	 */
	updateMatrix(assigned_index, delta, matrix) {
		if (!super.animationOver(assigned_index)) {
			this.calcIntermediateMatrix(assigned_index, delta, matrix);
		}
		else {
			this.calcEndMatrix(assigned_index, delta, matrix);
		}
	}

	/**
	 * @memberof ComboAnimation
	 * @description Computes an intermediate matrix of the animation
	 * @param {int} assigned_index The index assigned to the node
	 * @param {float} delta Time passed, in seconds, since last function call
	 * @param {Array<Array<float>>} matrix The matrix to apply the animation
	 */
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

	/**
	 * @memberof ComboAnimation
	 * @description Computes the end matrix of the animation
	 * @param {int} assigned_index The index assigned to the node
	 * @param {int} delta Irrelevant parameter, the animations will ignore this
	 * @param {Array<Array<float>>} matrix The matrix to apply the animation
	 */
	calcEndMatrix(assigned_index, delta, matrix) {
		let indexes = this.assigned_indexes[assigned_index];
		for (let i = 0; i < this.animations.length; i++) {
			let index = indexes[i];
			this.animations[i].updateMatrix(index, delta, matrix);
		}
	}

	/**
	 * @override
	 * @memberof ComboAnimation
	 * @description Calculates the total duration of the animation
	 * @return {float} The total duration of the animation based on {@link speed}
	 */
	calculateDuration () {
		console.log("MEOW");
	}

	/**
	 * @memberof ComboAnimation
	 * @description Copies the needed animations into {@link animations}
	 * @param {Array<Animation>} animations The array with the parsed animations
	 */
	setAnimations(animations) {
		for (let i = 0; i < this.animations_id.length; i++) {
			this.animations.push(animations.get(this.animations_id[i]));
		}
	}

	/**
	 * @override
	 * @memberof ComboAnimation
	 * @description Assigns an index in the progression variables to the calling node
	 * @return {int} Index assigned
	 */
	assignIndex () {
		let ret = this.assigned_indexes.length;
		this.assigned_indexes.push([]);
		for (let i = 0; i < this.animations.length; i++) {
			this.assigned_indexes[ret].push(this.animations[i].assignIndex());
		}
		return ret;
	}

	/**
	 * @override
	 * @memberof ComboAnimation
	 * @description Gets the type of the animation
	 * @return {String} The name of the animation
	 */
	getType() {
		return "ComboAnimation";
	}
};
