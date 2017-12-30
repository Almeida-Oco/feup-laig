let max_liq_height = 0.666;
class Cup extends CGFobject {
  //TODO each cup creates the same textures, change that
  constructor(scene, args) {
    let anim_time = args[0],
      inc = args[1];
    super(scene);
    this.scene = scene;
    this.cylinder1 = new Cylinder(scene, [1, 0.5, 0.8, 1, 25]);
    this.cylinder2 = new Cylinder(scene, [1, 0.5, 0.8, 1, 25], true);
    this.base = new Circle(scene, [25, 0.5]);
    this.liquids = [];

    this.height = 0;
    this.height_inc = 0.666 / (anim_time / inc);

    this.liquid = null
  }

  initBuffers(afs, aft) {
    this.cylinder1.initBuffers(afs, aft);
    this.cylinder2.initBuffers(afs, aft);
    this.base.initBuffers(afs, aft);
    for (let i = 0; i < this.liquids.length; i++)
      this.liquids.initBuffers(afs, aft);
  }

  nextLiquid() {
    if (this.height < max_liq_height) {
      this.height += this.height_inc;
      this.liquid = new Liquid(scene, this.height);
    }
  }

  prevLiquid() {
    if (this.height > 0) {
      this.height -= this.height_inc;
      this.liquid = new Liquid(scene, this.height);
    }
    else {
      this.height = 0;
      this.liquid = null;
    }
  }

  render(afs, aft) {
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.015);
    //Render liquid
    if (this.liquid !== null) {
      this.scene.pushMatrix();
      this.liquids[this.liquid].render(afs, aft);
      this.scene.popMatrix();
    }

    this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE);

    //Render cup
    this.cylinder2.render(afs, aft);
    this.base.render(afs, aft);

    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.base.render(afs, aft);
    this.scene.popMatrix();

    this.cylinder1.render(afs, aft);

    this.scene.popMatrix();
  }
}
