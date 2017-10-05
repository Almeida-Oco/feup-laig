/**
* MyTriangle
* @constructor
*/
function MyTriangle(scene, args) {
	this.scene = scene;
	this.x_axis = [args[0],args[3],args[6]];
	this.y_axis = [args[1],args[4],args[7]];
	this.z_axis = [args[2],args[5],args[8]];
	this.initBuffers();
};

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor = MyTriangle;

MyTriangle.prototype.initBuffers = function() {

    this.vertices = [
        this.x_axis[0],this.y_axis[0],this.z_axis[0],
        this.x_axis[1],this.y_axis[1],this.z_axis[1],
        this.x_axis[2],this.y_axis[2],this.z_axis[2]
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
    this.initGLBuffers();
};

MyTriangle.prototype.defTextCoords = function(afs, aft){
	this.texCoords = [
					0,0,
					(this.x_axis[0]-this.x_axis[1])/afs , (this.y_axis[0]-this.y_axis[1])/aft,
					(this.x_axis[0]-this.x_axis[2])/afs , (this.y_axis[0]-this.y_axis[2])/aft
	]
}

MyTriangle.prototype.render = function(afs, aft){
	this.defTextCoords(afs,aft);
	this.display();
}
