/**
* MyGraphLeaf class, representing a leaf in the scene graph.
* Possible types: rectangle, cylinder, sphere, triangle, patch]
* @constructor
**/

function MyGraphLeaf(graph, xmlelem, type) {
	this.graph = graph;
	this.type = type;
}
