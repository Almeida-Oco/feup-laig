class StaticLeaf extends GraphLeaf {
  constructor(scene, type, args, matrix) {
    super(scene, type, args);
    this.matrix = matrix;
  }

  render(mat, text) {
    this.scene.pushMatrix();
    let quad = [];
    this.scene.multMatrix(this.matrix);
    super.render(mat, text);
    this.scene.popMatrix();
  }
};
