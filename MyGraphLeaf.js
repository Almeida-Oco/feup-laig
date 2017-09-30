/**
* MyGraphLeaf class, representing a leaf in the scene graph.
* Possible types: rectangle, cylinder, sphere, triangle, patch]
* @constructor
**/

function MyGraphLeaf(graph, scene, type) {
	this.graph = graph;
	this.type = type;
	this.scene = scene;
}

MyGraphLeaf.prototype.render = function(material, texture, matrix){
	var primitive;
	if ( "triangle" == this.type )
		primitive = new MyTriangle();
	else{
		primitive = new MyTriangle();
		//Rest of primitives
	}

	primitive.display();
}
