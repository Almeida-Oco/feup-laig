/**
 * @description Constructor for GraphNode
 * @param nodeID ID of the node
 */

class GraphNode {
	constructor (nodeID, selectable) {
		this.nodeID = nodeID;
		this.selectable = selectable;

		this.children = [];

		this.animations = [];

		this.leaves = new Array();

		this.materialID = null ;

		this.textureID = null ;

		this.transformMatrix = mat4.create();
		mat4.identity(this.transformMatrix);
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
		this.animations.push(animation);
	}

	applyAnimations() {
		for (let i = 0; i < this.animations.length; i++) {
			this.animations[i].updateMatrix(this.transformMatrix);
		}
	}
};
