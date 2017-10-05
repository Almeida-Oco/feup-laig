/**
* MyTriangle
* @constructor
*/
function MyTriangle(scene, args) {
	this.scene = scene;
	this.x = [args[0],args[3],args[6]];
	this.y = [args[1],args[4],args[7]];
	this.z = [args[2],args[5],args[8]];
	this.initBuffers();
};

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor = MyTriangle;

MyTriangle.prototype.initBuffers = function() {

	this.vertices = [
		this.x[0],this.y[0],this.z[0],
		this.x[1],this.y[1],this.z[1],
		this.x[2],this.y[2],this.z[2]
	];

	this.indices = [
		0,1,2
	];

	this.normals = [
		0,1,0,
		0,1,0,
		0,1,0
	];

	this.primitiveType = this.scene.gl.TRIANGLES;

};

MyTriangle.prototype.defTextCoords = function(afs, aft){
	var a = Math.sqrt(Math.pow(this.x[2]-this.x[1],2) + Math.pow(this.y[2]-this.y[1],2) + Math.pow(this.z[2]-this.z[1],2)),
			b = Math.sqrt(Math.pow(this.x[0]-this.x[2],2) + Math.pow(this.y[0]-this.y[2],2) + Math.pow(this.z[0]-this.z[2],2)),
			c = Math.sqrt(Math.pow(this.x[1]-this.x[0],2) + Math.pow(this.y[1]-this.y[0],2) + Math.pow(this.z[1]-this.z[0],2));

	var cosy = ( Math.pow(a,2) + Math.pow(b,2) - Math.pow(c,2) )/(2*a*b),
			cosa = ( -Math.pow(a,2) + Math.pow(b,2) + Math.pow(c,2))/(2*b*c),
			cosb = ( Math.pow(a,2) - Math.pow(b,2) + Math.pow(c,2))/(2*a*c);
	this.texCoords = [
		0,0,
		(c-a*cosb)/afs , a*(Math.sqrt(1-Math.pow(cosb,2)))/aft,
		c/afs , 0
	];
	this.initGLBuffers();
}

MyTriangle.prototype.render = function(afs, aft){
	this.defTextCoords(afs,aft);
	this.display();
}
