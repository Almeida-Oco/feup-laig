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

  resetHeight() {
    this.height = 0;
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

  render(material, textures) {
    let is_waiter = textures[1][0],
      cup_text = textures[0],
      liq_text = textures[1][1];
    this.scene.pushMatrix();
    this.scene.translate(0, 0, 0.015);


    if (this.liquid !== null && liq_text !== null)
      this.renderLiquid(liq_text);

    if (is_waiter)
      this.scene.gl.blendFunc(this.scene.gl.ONE, this.scene.gl.SRC_COLOR);
    else
      this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE);


    this.renderCup(cup_text);

    this.scene.popMatrix();
  }

  renderLiquid(texture) {
    this.scene.pushMatrix();
    texture[0].bind();
    this.liquid.render(texture[1], texture[2]);
    this.scene.popMatrix();
  }

  renderCup(texture) {
    texture[0].bind();
    let afs = texture[1],
      aft = texture[2];

    this.cylinder2.render(afs, aft);
    this.base.render(afs, aft);

    this.scene.pushMatrix();
    this.scene.rotate(Math.PI, 0, 1, 0);
    this.base.render(afs, aft);
    this.scene.popMatrix();

    this.cylinder1.render(afs, aft);
  }

  linearInterpolation(min, max, t) {
    let passed = t / this.anim_time;
    return (1 - passed) * min + (passed * max);
  }
}
