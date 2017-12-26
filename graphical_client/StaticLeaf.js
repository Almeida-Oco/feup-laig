class StaticLeaf extends GraphLeaf {
  constructor(scene, type, args, position) {
    super(scene, type, args);
    this.position = position;
  }

  render(mat, text) {
    this.scene.pushMatrix();
    this.scene.multMatrix(this.position);
    super.render(mat, text);
    this.scene.popMatrix();
  }
};
