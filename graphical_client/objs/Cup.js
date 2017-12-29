/**
 * Constructor of Cup
 * @param CGFScene scene The current scene
 * @constructor
 */
function Cup(scene) {
  CGFobject.call(this, scene);
  this.scene = scene;
  this.cylinder1 = new Cylinder(scene, [1, 0.5, 0.8, 1, 20]);
  this.cylinder2 = new Cylinder(scene, [1, 0.5, 0.8, 1, 20], true);
  this.base = new Circle(scene, [20, 0.5]);
};

Cup.prototype = Object.create(CGFobject.prototype);
Cup.prototype.constructor = Cup;

Cup.prototype.initBuffers = function (afs, aft) {
  this.cyclinder.initBuffers();
  this.base.initBuffers();
}

Cup.prototype.render = function (afs, aft) {
  this.scene.pushMatrix();
  this.scene.translate(0, 0, 1);
  this.scene.pushMatrix();
  this.cylinder1.render(afs, aft);
  this.cylinder2.render(afs, aft);
  this.scene.rotate(Math.PI, 0, 1, 0);
  this.base.render(afs, aft);
  this.scene.popMatrix();
  this.base.render(afs, aft);
  this.scene.popMatrix();
}
