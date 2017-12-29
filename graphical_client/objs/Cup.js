class Cup extends CGFobject {
  constructor(scene) {
    this.cylinder = new Cylinder(2, 2, 3, 20, 2);
    this.base = new Circle(20, 2);
  }

  initBuffers() {
    this.cyclinder.initBuffers();
    this.base.initBuffers();
  }

  render(afs, aft) {
    this.cylinder.render(afs, aft);
    this.base.render(afs, aft)
  }
};
