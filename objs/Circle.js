/**
 * Constructor of Circle
 * @param CGFScene scene The current scene
 * @param Array<int> args The arguments of the object [slices, radius]
 * @constructor
 */
function Circle(scene, args) {
	CGFobject.call(this,scene);

	this.slices 	= args[0];
	this.radius		= args[1];
	this.angle 		= (2*Math.PI) / this.slices;
};

Circle.prototype = Object.create(CGFobject.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.initBuffers = function(afs, aft) {
	this.vertices 	= [];
	this.indices 		= [];
	this.normals 		= [];
	this.texCoords 	= [];

  this.index = 0;
	var theta = 0.0;
	var center = this.index;

	this.vertices.push(0, 0, 0);
	this.texCoords.push(0.5 * afs, 0.5 * aft);
	this.index++;

	for(j = 0; j < this.slices; j++){
		this.vertices.push(this.radius*Math.cos(theta)); this.vertices.push(this.radius*Math.sin(theta)); this.vertices.push(0);
		this.texCoords.push((Math.cos(theta)+1) * afs/2.0,((-Math.sin(theta)+1) * aft/2.0));

 		this.index++;
		theta += this.angle;

 		this.vertices.push(this.radius*Math.cos(theta), this.radius*Math.sin(theta), 0);
 		this.index++;



		this.texCoords.push((Math.cos(theta)+1) * afs/2.0,((-Math.sin(theta)+1) * aft/2.0));


		this.indices.push(center, this.index-2, this.index-1);
		this.normals.push(0, 0, 1);	this.normals.push(0, 0, 1);	this.normals.push(0, 0, 1);

	}

	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
}

Circle.prototype.render = function (afs, aft) {
	if (this.indices === undefined) {
		this.initBuffers(afs, aft);
	}
	this.display();
}
