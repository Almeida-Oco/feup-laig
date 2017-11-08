/**
 * @description Constructor of Quad
 * @param scene Scene to render primitive in
 * @param args Array with the following elements [x1, y1, x2, y2]
 */
function Quad(scene,args) {
    CGFobject.call(this,scene);

		this.x1 = args[0];
		this.y1 = args[1];
		this.x2 = args[2];
		this.y2 = args[3];

    this.initBuffers();
};

Quad.prototype = Object.create(CGFobject.prototype);
Quad.prototype.constructor=Quad;

/**
 * @description Initializes the arrays needed for rendering
 */
Quad.prototype.initBuffers = function () {
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
		this.x1, this.y1, 1,
    this.x1, this.y2, 1,
    this.x2, this.y1, 1,
    this.x2, this.y2, 1
  ];
  this.primitiveType=this.scene.gl.TRIANGLES;

};

/**
 * @description Defines the texture coordinates of each vertex
 * @param afs Amplification factor in the X axis
 * @param aft Amplification factor in the Y axis
 */
Quad.prototype.defTextCoords = function(afs, aft){
	var s = this.x1-this.x2, t = this.y1-this.y2;
	this.texCoords = [
		0, 0,
		0, t/aft,
		s/afs, t/aft,
		s/afs,0
	];
	this.initGLBuffers();
}

/**
 * @description Renders the primitive, but first defines the texture coordinates
 * @param afs Amplification factor in the X axis to be set
 * @param aft Amplification factor in the Y axis to be set
 */
Quad.prototype.render = function(afs, aft){
	this.defTextCoords(afs,aft);
	this.display();
}
