let bottom_radius = 0.45;
let top_radius = 0.65;
let max_height = 0.6;

class Liquid extends CGFobject {
  constructor(scene, height) {
    super(scene);
    this.scene = scene;
    this.height = height;
    this.top_radius = this.linearInterpolation(bottom_radius, top_radius, height);
    this.liq_cyl1 = new Cylinder(scene, [this.height, bottom_radius, this.top_radius, 1, 25]);
    this.liq_cyl2 = new Cylinder(scene, [this.height, bottom_radius, this.top_radius, 1, 25], true);
    this.liq_bottom = new Circle(scene, [25, bottom_radius]);
    this.liq_top = new Circle(scene, [25, this.top_radius]);
  }

  linearInterpolation(min, max, t) {
    let passed = t / max_height;
    return (1 - passed) * min + (passed * max);
  }

  initBuffers(afs, aft) {
    this.liq_cyl1.initBuffers(afs, aft);
    this.liq_cyl2.initBuffers(afs, aft);
    this.liq_bottom.initBuffers(afs, aft);
    this.liq_top.initBuffers(afs, aft);
  }

  render(afs, aft) {
    this.initBuffers(afs, aft);

    this.scene.pushMatrix();
    this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.SRC_COLOR);
    this.scene.translate(0, 0, 0.06);

    this.liq_cyl2.render(afs, aft);
    this.liq_bottom.render(afs, aft);

    this.scene.pushMatrix();
    this.scene.translate(0, 0, this.height);
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.liq_top.render(afs, aft);
    this.scene.popMatrix();

    this.scene.pushMatrix();
    this.scene.translate(0, 0, this.height);
    this.liq_top.render(afs, aft);
    this.scene.popMatrix();
    this.liq_cyl1.render();
    this.liq_bottom.render(afs, aft);
    this.scene.popMatrix();
  }
}
