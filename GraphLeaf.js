let prim_selector = {
	'triangle': 	function (scene, args) {
		return new Triangle(scene, args);
	},
	'sphere': 		function (scene, args) {
		return new Sphere(scene, args);
	},
	'rectangle': 	function (scene, args) {
		return new Quad(scene, args);
	},
	'cylinder': 	function (scene, args) {
		return new Cylinder(scene, args);
	},
	'patch': 			function (scene, args) {
		return new Patch(scene, args);
	},
	'circle': 		function (scene, args) {
		return new Circle(scene, args);
	}
};

/**
 * @description Constructor for GraphLeaf
 * @param {String} type Type of leaf to create
 * @param {Array<T>} args Arguments of given leaf, will vary according to type
 * @param scene The scene to render the leaf in
 */
function GraphLeaf(type, args, scene) {
	this.type = type;
	this.primitive = prim_selector[type](scene, args);
}

/**
 * @description Renders the leaf with correct parameters and selects the correct shader
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
