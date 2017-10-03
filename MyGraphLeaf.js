/**
* MyGraphLeaf class, representing a leaf in the scene graph.
* Possible types: rectangle, cylinder, sphere, triangle, patch]
* @constructor
**/

function MyGraphLeaf(graph, type) {
	this.graph = graph;
	this.type = type;
}

//TODO render primitive
/**
 * @brief Renders the leaf with correct parameters
 * @param material The material to apply to the primitive
 * @param texture The texture to apply to the primitive, null if no texture to apply
 * @param matrix Matrix to apply to the primitive before rendering
 */
MyGraphLeaf.prototype.render = function(material, texture, scene){
	var primitive;
	if ( "triangle" == this.type )
		primitive = new MyTriangle(this.scene);
	else{
		primitive = new MyTriangle(this.scene);
		//Rest of primitives


	}

	this.scene.multMatrix(matrix);
	primitive.apply();
	primitive.display();

	//console.log("Rendered pimitive type "+this.type);

}
