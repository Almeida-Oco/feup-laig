/**
 * @description Constructor for GraphNode
 * @param nodeID ID of the node
 */

class GraphNode {
	constructor (nodeID, selectable) {
		this.nodeID = nodeID;
		this.children = [];
		this.leaves = new Array();
		this.materialID = null ;
		this.textureID = null ;

		this.transformMatrix = mat4.create();
		mat4.identity(this.transformMatrix);

		this.selectable = selectable;
		this.animations = []; //list of pairs [[Animation1, assigned_index1], [Animation2, assigned_index2] (...)]
		this.last_time = 0;
	}

	/**
	 * @description Adds a new child to this node
	 * @param nodeID ID of the child to add, stored as a string
	 */
	addChild (node_id) {
		this.children.push(node_id);
	}

	/**
	 * @description Adds a new leaf to this node
	 * @param leaf The leaf to add to the leaves array
	 */
	addLeaf (leaf) {
		this.leaves.push(leaf);
	}

	/**
	 * @description Adds a new animation to the node
	 * @param animation Animation to add
	 */
	addAnimation (animation) {
		this.animations.push([animation, animation.assignIndex()]);
	}

	applyAnimations() {
		let delta = this.getTimeElapsed(), temp_matrix = mat4.create(), max_i = this.animations.length;
    mat4.identity(temp_matrix);
		for (let i = 0; (i < max_i && delta !== -1); i++) { //if it aint the first time running
			let animation = this.animations[i][0],
          assigned_index = this.animations[i][1];

			if ((!animation.animationOver(assigned_index)) || i == max_i - 1) {
				animation.updateMatrix(assigned_index, (delta / 1000), temp_matrix);
				break; //stop at first successfull animation
			}
		}

		return temp_matrix;
	}

	/**
	 * @description Gets the time elapsed from previous function call
	 * @return Number of milliseconds passed
	 */
	getTimeElapsed () {
		let time_elapsed = performance.now() - this.last_time;
		if (this.last_time === 0){
			this.last_time = performance.now();
			return -1;
		}
		else {
			this.last_time = performance.now();
			return time_elapsed;
		}
	}
};
