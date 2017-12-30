class Cup extends CGFobject {
  constructor(scene, args) {
    let anim_time = args[0],
      inc = args[1];
    super(scene);
    this.scene = scene;
    this.cylinder1 = new Cylinder(scene, [1, 0.5, 0.8, 1, 25]);
    this.cylinder2 = new Cylinder(scene, [1, 0.5, 0.8, 1, 25], true);
    this.base = new Circle(scene, [25, 0.5]);
    this.liquids = [];
    this.glass_text = new CGFtexture(this.scene, 'scenes/images/glass.png');

    let height = 0,
      height_inc = 0.666 / (anim_time / inc);
    for (let i = 0; i < anim_time; i += inc, height += height_inc) {
      this.liquids.push(new Liquid(scene, height));
    }

    this.liquid = -1;
  }

  initBuffers(afs, aft) {
    this.cylinder1.initBuffers(afs, aft);
    this.cylinder2.initBuffers(afs, aft);
    this.base.initBuffers(afs, aft);
    for (let i = 0; i < this.liquids.length; i++)
      this.liquids.initBuffers(afs, aft);
  }

  nextLiquid() {
    if (this.liquid < this.liquids.length - 1)
      this.liquid++;
  }

  prevLiquid() {
    if (this.liquid > -1)
      this.liquid--;
  }

  render(afs, aft) {
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.015);
    //Render liquid
    if (this.liquid >= 0) {
      this.scene.pushMatrix();
      this.liquids[this.liquid].render(afs, aft);
      this.scene.popMatrix();
    }


    //Setup glass shaders
    let prev_shader = this.activateShaders();
    this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE);
    this.glass_text.bind(0);

    //Render cup
    this.cylinder2.render(afs, aft);
    this.base.render(afs, aft);

    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.base.render(afs, aft);
    this.scene.popMatrix();

    this.cylinder1.render(afs, aft);

    this.scene.popMatrix();

    this.disableShaders(prev_shader);
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
