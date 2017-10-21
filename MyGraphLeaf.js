/**
 * @description Constructor for MyGraphLeaf
 * @param type Type of leaf to create
 * @param args Arguments of given leaf, will vary according to type
 * @param scene The scene to render the leaf in
 */
function MyGraphLeaf(type, args, scene) {
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
	else
		console.log("Unknown type: "+this.type+" aborting!");
}

/**
 * @description Renders the leaf with correct parameters
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
