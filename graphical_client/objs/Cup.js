let max_liq_height = 0.666;
class Cup extends CGFobject {
  //TODO each cup creates the same textures, change that
  constructor(scene, args) {
    super(scene);
    this.anim_time = args[0];
    this.scene = scene;
    this.cylinder1 = new Cylinder(scene, [1, 0.5, 0.8, 1, 25]);
    this.cylinder2 = new Cylinder(scene, [1, 0.5, 0.8, 1, 25], true);
    this.base = new Circle(scene, [25, 0.5]);
    this.liquids = [];

    this.height = 0;
    this.liquid = null
  }

  initBuffers(afs, aft) {
    this.cylinder1.initBuffers(afs, aft);
    this.cylinder2.initBuffers(afs, aft);
    this.base.initBuffers(afs, aft);
    for (let i = 0; i < this.liquids.length; i++)
      this.liquids.initBuffers(afs, aft);
  }

  nextLiquid(time_elapsed) {
    if (this.height < max_liq_height) {
      this.height += this.linearInterpolation(0, max_liq_height, time_elapsed);
      if (this.height > max_liq_height)
        this.height = max_liq_height;

      this.liquid = new Liquid(this.scene, this.height);
      return false;
    }

    return true;
  }

  prevLiquid(time_elapsed) {
    if (this.height > 0) {
      this.height -= this.linearInterpolation(0, max_liq_height, time_elapsed);
      if (this.height < 0)
        this.height = 0;
      console.log("HEight = " + this.height);
      this.liquid = new Liquid(this.scene, this.height);
      return false;
    }
    else {
      this.height = 0;
      this.liquid = null;
      return true;
    }
  }

  render(material, texture) {
    let is_waiter = texture[1] === true;
    let cup_text = texture[0],
      liquid_text = texture[1];
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.015);
    //Render liquid
    if (this.liquid !== null && liquid_text !== null && liquid_text !== undefined) {
      this.scene.pushMatrix();
      liquid_text[0].bind();
      this.liquid.render(liquid_text[1], liquid_text[2]);
      this.scene.popMatrix();
    }
    cup_text[0].bind();
    let afs = cup_text[1],
      aft = cup_text[2];

    if (!is_waiter)
      this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE);
    else
      this.scene.gl.blendFunc(this.scene.gl.ONE, this.scene.gl.SRC_COLOR);

    this.scene.gl.enable(this.scene.gl.BLEND);

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

  linearInterpolation(min, max, t) {
    let passed = t / this.anim_time;
    return (1 - passed) * min + (passed * max);
  }
}
