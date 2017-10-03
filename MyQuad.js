/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyQuad(scene,args,minS,maxS,minT,maxT) {
    CGFobject.call(this,scene);

    this.minS = minS;
    this.minT = minT;
    this.maxS = maxS;
    this.maxT = maxT;

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

    this.texCoords = [
            this.minS,this.maxT,
            this.maxS,this.maxT,
            this.minS,this.minT,
            this.maxS,this.minT
    ]
    this.primitiveType=this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
