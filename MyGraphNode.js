/**
* MyGraphNode class, representing an intermediate node in the scene graph.
* @constructor
**/

function MyGraphNode(graph, nodeID) {
	this.graph = graph;

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
* Adds the reference (ID) of another node to this node's children array.
*/
MyGraphNode.prototype.addChild = function(nodeID) {
	this.children.push(nodeID);
}

/**
* Adds a leaf to this node's leaves array.
*/
MyGraphNode.prototype.addLeaf = function(leaf) {
	this.leaves.push(leaf);
}

MyGraphNode.prototype.render = function(material, texture, scene){
	scene.pushMatrix();
	scene.multMatrix( this.transformMatrix );

	for (unsigned int i = 0 ; i < this.children ; i++ )
		this.children[i].render(material, texture, scene);

	for ( unsigned int i = 0 ; i < this.leaves ; i++ )
		this.leaves[i].render(material, texture, scene);

	scene.popMatrix();
}
