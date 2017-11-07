/**
 * @description Constructor for MyGraphNode
 * @param nodeID ID of the node
 */
function MyGraphNode(nodeID) {
	this.nodeID = nodeID;

	// IDs of child nodes.
	this.children = [];

	// IDs of child nodes.
	this.leaves = new Array();

	// The material ID.MyGraphNode
	this.materialID = null ;

	// The texture ID.
	this.textureID = null ;

	this.transformMatrix = mat4.create();
	mat4.identity(this.transformMatrix);
}

/**
 * @description Adds a new child to this node
 * @param nodeID ID of the child to add, stored as a string
 */
MyGraphNode.prototype.addChild = function(nodeID) {
	this.children.push(nodeID);
}

/**
 * @description Adds a new leaf to this node
 * @param leaf The leaf to add to the leaves array
 */
MyGraphNode.prototype.addLeaf = function(leaf) {
	this.leaves.push(leaf);
}
