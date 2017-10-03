/**
* MyGraphLeaf class, representing a leaf in the scene graph.
* Possible types: rectangle, cylinder, sphere, triangle, patch]
* @constructor
**/

function MyGraphLeaf(graph, type, args, scene) {
	this.graph = graph;
	this.type = type;
	this.primitive;

	if ( "triangle" == this.type )
		this.primitive = new MyTriangle(scene,args);
	else if ( "sphere" == this.type)
		this.primitive = new MySemiCircle(scene,args,10);
	else if ( "rectangle" == this.type)
		this.primitive = new MyQuad(scene,args,0,1,0,1);
	else if ( "cylinder" == this.type)
		this.primitive = new MyCylinder(scene,args, 10, 1);
}

//TODO render primitive
/**
 * @brief Renders the leaf with correct parameters
 * @param material The material to apply to the primitive
 * @param texture The texture to apply to the primitive, null if no texture to apply
 * @param matrix Matrix to apply to the primitive before rendering
 */
MyGraphLeaf.prototype.render = function(material, texture, scene){
	material.apply();
	this.primitive.display();
}
