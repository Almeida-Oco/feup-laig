/**
 * @description Constructor for GraphLeaf
 * @param type Type of leaf to create
 * @param args Arguments of given leaf, will vary according to type
 * @param scene The scene to render the leaf in
 */
function GraphLeaf(type, args, scene) {
	this.type = type;
	this.primitive;

	if ( "triangle" == this.type )
		this.primitive = new Triangle(scene,args);
	else if ("sphere" == this.type)
		this.primitive = new Sphere(scene,args);
	else if ("rectangle" == this.type)
		this.primitive = new Quad(scene,args);
	else if ("cylinder" == this.type)
		this.primitive = new Cylinder(scene,args);
	else if ("patch" == this.type)
		this.primitive = new Patch(scene,args);
	else
		console.log("Unknown type: "+this.type+" aborting!");
}

/**
 * @description Renders the leaf with correct parameters
 * @param material The material to apply to the primitive
 * @param texture The texture to apply to the primitive, null if no texture to apply
 * @param matrix Matrix to apply to the primitive before rendering
 * @param boolean selectable if the object is selectable for shader thing
 */
 GraphLeaf.prototype.render = function(material, texture, scene, selectable) {
	 material.apply();

	 if (selectable) {
		 scene.setActiveShader(scene.sel_shader);
	 }

	 if (texture != null){
		 texture[0].bind();
		 material.setTextureWrap('REPEAT','REPEAT');
		 this.primitive.render(texture[1],texture[2]);
	 }
	 else {
		 this.primitive.render(1,1);
		 this.primitive.display();
	 }

	 if (selectable) {
		 scene.setActiveShader(scene.defaultShader);
	 }


 }
