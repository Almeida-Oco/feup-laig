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
	else if ("sphere" == this.type)
		this.primitive = new MySphere(scene,args);
	else if ("rectangle" == this.type)
		this.primitive = new MyQuad(scene,args);
	else if ("cylinder" == this.type)
		this.primitive = new MyCylinder(scene,args);
	else if ("patch" == this.type)
		this.primitive = new MyPatch(scene,args);
	else if ("wave_obj" == this.type)
		this.primitive = new MyObject(scene,args);
}

//TODO render primitive
/**
 * @brief Renders the leaf with correct parameters
 * @param material The material to apply to the primitive
 * @param texture The texture to apply to the primitive, null if no texture to apply
 * @param matrix Matrix to apply to the primitive before rendering
 */
MyGraphLeaf.prototype.render = function(material, texture, scene){
	if ( texture != null ){
		material.apply();
		texture[0].bind();
		material.setTextureWrap('REPEAT','REPEAT');
		this.primitive.render(texture[1],texture[2]);
	}
	else {
		material.apply();
		this.primitive.render(1,1);
		this.primitive.display();
	}
}
