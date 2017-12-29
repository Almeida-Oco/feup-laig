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

  this.text = new CGFtexture(this.scene, "scenes/images/glass.png");
};

Cup.prototype = Object.create(CGFobject.prototype);
Cup.prototype.constructor = Cup;

Cup.prototype.initBuffers = function (afs, aft) {
  this.cyclinder.initBuffers();
  this.base.initBuffers();
}

Cup.prototype.render = function (afs, aft) {
  let shader = this.scene.activeShader;
  this.scene.gl.enable(this.scene.gl.BLEND);
  this.scene.gl.depthFunc(this.scene.gl.LESS);
  this.scene.setActiveShader(this.scene.blend_shader);
  this.text.bind(0);


  this.scene.pushMatrix();
  this.scene.translate(0, 0, 1);

  this.scene.pushMatrix();
  this.cylinder2.render(afs, aft);
  this.cylinder1.render(afs, aft);
  this.base.render(afs, aft);
  this.scene.popMatrix();

  this.scene.rotate(Math.PI, 0, 1, 0);
  this.base.render(afs, aft);
  this.scene.popMatrix();


  this.scene.setActiveShader(shader);
  this.scene.gl.disable(this.scene.gl.BLEND);
  this.scene.gl.depthFunc(this.scene.gl.LEQUAL);
}
