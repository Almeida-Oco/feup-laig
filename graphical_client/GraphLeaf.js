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
    this.pickable = false;
  }

  setPickable(id) {
    this.pickable = true;
    this.id = id;
    this.pick_obj = (prim_selector[this.type])(this.scene, this.args);
  }

  /**
   * @description Renders the leaf with correct parameters and selects the correct shader
   * @param material {Array<T>} An array with the material and the afs and aft. [CGFtexture, afs, aft]
   * @param texture The texture to apply to the primitive, null if no texture to apply
   */
  render(material, texture) {
    let applyMaterial = function (mat) {
      if (mat !== null && mat !== undefined)
        mat.apply();
    };
    let applyTexture = function (tex) {
      if (tex !== undefined && tex !== null)
        tex.bind();
    };
    let render = function (afs, aft) {
      if (afs !== undefined && aft !== undefined && afs > 0 && aft > 0)
        this.primitive.render(afs, aft);
      else
        this.primitive.render(1, 1);
    }.bind(this);

    applyMaterial(material);
    applyTexture(texture[0]);
    render(texture[1], texture[2]);
    if (this.pickable) {
      this.scene.registerForPick(this.id, this.pick_obj);
    }
  }
};
