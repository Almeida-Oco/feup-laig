/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyQuad(scene,args) {
    CGFobject.call(this,scene);

		this.x1 = args[0];
		this.y1 = args[1];
		this.x2 = args[2];
		this.y2 = args[3];

    this.initBuffers();
};

MyQuad.prototype = Object.create(CGFobject.prototype);
MyQuad.prototype.constructor=MyQuad;

MyQuad.prototype.initBuffers = function () {
    this.vertices = [
            this.x1, this.y1, 0,
            this.x1, this.y2, 0,
            this.x2, this.y1, 0,
            this.x2, this.y2, 0
            ];

    this.indices = [
            0, 1, 2,
            3, 2, 1
        ];

    this.normals = [
             0,0,1,
             0,0,1,
             0,0,1,
             0,0,1
        ];
    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyQuad.prototype.defTextCoords = function(afs, aft){
	var s = this.x2/afs, t = this.y1/aft;
	this.texCoords = [
					0, t,
					0, 0,
					s, t,
					s,0
	]
}

MyQuad.prototype.render = function(afs, aft){
	this.defTextCoords(afs,aft);
	this.display();
}
