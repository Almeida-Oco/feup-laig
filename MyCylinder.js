/**
* MyCylinder
* @constructor
*/
function MyCylinder(scene, args) {
	CGFobject.call(this,scene);
	this.height = args[0];
	this.b_radius = args[1];
	this.t_radius = args[2];
	this.slices = args[4];
	this.stacks = args[3];

	this.initBuffers();
};

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {
	var t = Math.PI*2/this.slices, delta = (this.t_radius - this.b_radius)/this.stacks;
	var ang = 0;

	this.indices = [];
	this.vertices = [];
	this.normals = [];
	this.texCoords = [];
	verts = 0;

	for(j = 0; j <= this.stacks; j++){
		var x = (this.b_radius*Math.cos(ang)) + (j*delta*Math.cos(ang)),
				y = y = (this.b_radius*Math.sin(ang)) + (j*delta*Math.sin(ang)),
				z = this.height * ( j / this.stacks);
		this.vertices.push(x, y,  z);
		this.normals.push(x, y, 0);
		this.texCoords.push(0, z / this.height );
		verts++;

		for(i = 1; i <= this.slices	; i++){
			ang+=t;
			x = (this.b_radius*Math.cos(ang)) + (j*delta*Math.cos(ang));
			y = (this.b_radius*Math.sin(ang)) + (j*delta*Math.sin(ang));
			this.vertices.push(x, y, z);
			this.normals.push(x, y, 0);
			this.texCoords.push(i / this.slices, z / this.height );
			verts++;

			if(j > 0 && i > 0){
				this.indices.push(verts-1, verts-2, verts-this.slices-2);
				this.indices.push(verts-this.slices-3, verts-this.slices-2, verts-2);
			}
		}
	}

	this.primitiveType = this.scene.gl.TRIANGLES;

	this.initGLBuffers();
};

MyCylinder.prototype.render = function(afs, aft){
	this.display();
}
