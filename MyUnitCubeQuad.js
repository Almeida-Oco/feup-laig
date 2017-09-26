/**
* MyUnityCube
* @constructor
*/
function MyUnitCubeQuad(scene) {
    CGFobject.call(this,scene);

    this.quad=new MyQuad(this.scene, -0.5, 0.5, -0.5, 0.5);
    this.quad.initBuffers();
};

MyUnitCubeQuad.prototype = Object.create(CGFobject.prototype);
MyUnitCubeQuad.prototype.constructor = MyUnitCubeQuad;

MyUnitCubeQuad.prototype.display = function () {
    //FRONT
    this.scene.pushMatrix();
    this.scene.translate(0,0,0.5);
    this.quad.display();
    this.scene.popMatrix();
    //BEHIND
    this.scene.pushMatrix();
    this.scene.translate(0,0,-0.5);
    this.scene.rotate(Math.PI, 1, 0, 0);
    this.quad.display();
    this.scene.popMatrix();
    //RIGHT
    this.scene.pushMatrix();
    this.scene.translate(0.5,0,0);
    this.scene.rotate(Math.PI / 2, 0, 1, 0);
    this.quad.display();
    this.scene.popMatrix();
    //LEFT
    this.scene.pushMatrix();
    this.scene.translate(-0.5,0,0);
    this.scene.rotate(-(Math.PI / 2), 0, 1, 0);
    this.quad.display();
    this.scene.popMatrix();
    //TOP
    this.scene.pushMatrix();
    this.scene.translate(0,0.5,0);
    this.scene.rotate(-(Math.PI / 2), 1, 0, 0);
    this.quad.display();
    this.scene.popMatrix();
    //BOTTOM
    this.scene.pushMatrix();
    this.scene.translate(0,-0.5,0);
    this.scene.rotate(Math.PI / 2, 1, 0, 0);
    this.quad.display();
    this.scene.popMatrix();
};
