let bottom_radius = 0.5;
let top_radius = 0.7;
let max_height = 0.666;

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

    this.liq_text = new CGFtexture(this.scene, "scenes/images/tea1.png");
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

    let prev_shader = this.activateShaders();

    this.scene.pushMatrix();
    this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.SRC_COLOR);
    this.liq_text.bind(0);

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

    this.disableShaders(prev_shader)
  }

  activateShaders() {
    this.scene.gl.enable(this.scene.gl.BLEND);
    this.scene.gl.depthFunc(this.scene.gl.LESS);
    this.scene.setActiveShader(this.scene.blend_shader);

    return this.scene.activeShader;
  }

  disableShaders(prev_shader) {
    this.scene.setActiveShader(prev_shader);
    this.scene.gl.disable(this.scene.gl.BLEND);
    this.scene.gl.depthFunc(this.scene.gl.LEQUAL);
  }
}
