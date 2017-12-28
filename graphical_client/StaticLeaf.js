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



  render() {
    this.scene.pushMatrix();
    let quad = [];
    this.scene.multMatrix(this.matrix);
    super.render(this.material, this.texture);
    this.scene.popMatrix();
  }
};
