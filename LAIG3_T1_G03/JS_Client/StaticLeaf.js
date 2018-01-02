class StaticLeaf extends GraphLeaf {
  constructor(scene, type, args, leaf_args) {
    super(scene, type, args);
    this.matrix = leaf_args[0];
    this.material = null;
    this.texture = null;
    if (leaf_args[1] !== null && leaf_args[1] !== undefined)
      this.material = leaf_args[1];
    if (leaf_args[2] !== null && leaf_args[2] !== undefined)
      this.texture = leaf_args[2];
  }

  setTexture(text) {
    if (text !== null && text !== undefined)
      this.texture = text;
    else
      console.log("Could not set texture of leaf!");
  }

  getTexture() {
    return this.texture;
  }

  setMaterial(mat) {
    if (mat !== null && mat !== undefined)
      this.mat = mat;
    else
      console.log("Could not set material of leaf!");
  }

  getMaterial() {
    return this.material;
  }

  render() {
    this.scene.pushMatrix();
    this.scene.multMatrix(this.matrix);
    if (this.primitive instanceof Cup)
      this.primitive.render(this.material, this.texture);
    else
      super.render(this.material, this.texture);
    this.scene.popMatrix();
  }
};