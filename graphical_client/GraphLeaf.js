var prim_selector = {
  'triangle': function (scene, args) {
    return new Triangle(scene, args);
  },
  'sphere': function (scene, args) {
    return new Sphere(scene, args);
  },
  'rectangle': function (scene, args) {
    return new Quad(scene, args);
  },
  'cylinder': function (scene, args) {
    return new Cylinder(scene, args);
  },
  'patch': function (scene, args) {
    return new Patch(scene, args);
  },
  'circle': function (scene, args) {
    return new Circle(scene, args);
  }
};

class GraphLeaf {
  /**
   * @description Constructor for GraphLeaf
   * @param {String} type Type of leaf to create
   * @param {Array<T>} args Arguments of given leaf, will vary according to type
   * @param scene The scene to render the leaf in
   */
  constructor(scene, type, args) {
    this.scene = scene;
    this.type = type;
    this.args = args;
    this.primitive = (prim_selector[type])(scene, args);
  }

  /**
   * @description Renders the leaf with correct parameters and selects the correct shader
   * @param material {Array<T>} An array with the material and the afs and aft. [CGFtexture, afs, aft]
   * @param texture The texture to apply to the primitive, null if no texture to apply
   */
  render(material, texture) {
    if (material !== null && material !== undefined)
      material.apply();

    if (texture !== undefined && texture !== null && texture[0] !== null) {
      texture[0].bind();
      material.setTextureWrap('REPEAT', 'REPEAT');
      this.primitive.render(texture[1], texture[2]);
    }
    else {
      this.primitive.render(1, 1);
    }
  }
};
