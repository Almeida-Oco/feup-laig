let tokens_prop = {
  'X': "player1_text",
  'O': "player2_text",
  '@': "player2_waiter_text",
  '%': "player2_waiter_text",
  'W': "waiter_text",
  '.': "dark_wood_text"
};

let anim_parser = {
  "linear": function (speed, args) {
    return new LinearAnimation(speed, args);
  },
  "circular": function (speed, args) {
    return new CircularAnimation(speed, args);
  },
  "bezier": function (speed, args) {
    return new BezierAnimation(speed, args);
  },
  "combo": function (speed, args) {
    return new ComboAnimation(args);
  }
};

let table_regex = /table(\d)$/;
let seat_regex = /seat(\d)$/

class SceneGraph {
  /**
   * @description Contructor for SceneGraph
   * @param file_name Name of the xml file to open
   * @param scene Scene to render the graph
   */
  constructor(scene) {
    this.loadedOk = null;
    this.start_time = 0;

    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.statics = [];
    this.nodes = [];
    this.tokens = [];
    this.root_id = null; // The id of the root element.
    this.tables_root = "tables";

    // File reading
    this.reader = new CGFXMLreader();

    this.id = 0;
  }

  loadGraph(filename) {
    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */
    this.reader.open("scenes/" + filename, this);
  }

  /**
   * @description Called when the XML is ready to be read
   */
  onXMLReady() {
    console.log("XML Loading finished.");
    let parser = new GraphParser(this.reader);

    if ((this.initials = parser.parseInitials()) === null) {
      console.error("parseInitials() failed!\n");
      return null;
    }
    if ((this.illumination = parser.parseIllumination()) === null) {
      console.error("parseIllumination() failed!\n");
      return null;
    }
    if ((this.lights = parser.parseLights()) === null) {
      console.error("parseLights() failed!\n");
      return null;
    }
    if ((this.textures = parser.parseTextures()) === null) {
      console.error("parseTextures() failed!\n");
      return null;
    }
    if ((this.materials = parser.parseMaterials()) === null) {
      console.error("parseMaterials() failed!\n");
      return null;
    }
    if ((this.animations = parser.parseAnimations()) === null) {
      console.error("parseAnimations() failed!\n");
      return null;
    }
    console.log("Got here\n");
    let nodes_ret;
    if ((nodes_ret = parser.parseNodes()) === null)
      return null;
    console.log("After parse Nodes\n");

    this.root_id = nodes_ret[0];
    this.nodes = nodes_ret[1];

    this.setupMaterials();
    this.setupTextures();
    this.setupAnimations();
    this.scene.pushMatrix();
    mat4.identity(this.scene.activeMatrix);
    let root = this.nodes.get(this.root_id);
    this.setupStatics(this.root_id, root.get("material"), root.get("texture"), -1, -1, root.get("static"));
    this.scene.popMatrix();
    this.clipStaticNodes(this.nodes.get(this.root_id));
    this.setupNodes();
    console.log("Loaded OK\n");
    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
  }

  setupAnimations() {
    let combo_anims = [];
    this.animations.forEach(function (value, key, map) {
      let type = value.get("type");
      if (type === "combo")
        combo_anims.push(key);

      map[key] = anim_parser[type](value.get("speed"), value.get("args"));
    });
    combo_anims.forEach(function (value, key, map) {
      value.setAnimations(this.animations);
    })
  }

  setupMaterials() {
    this.materials.forEach(function (value, key, map) {
      if (value !== null && value !== undefined) {
        let material = new CGFappearance(this.scene);
        material.setAmbient(value.get("ambient")["r"], value.get("ambient")["g"], value.get("ambient")["b"], value.get("ambient")["a"]);
        material.setDiffuse(value.get("diffuse")["r"], value.get("diffuse")["g"], value.get("diffuse")["b"], value.get("diffuse")["a"]);
        material.setSpecular(value.get("specular")["r"], value.get("specular")["g"], value.get("specular")["b"], value.get("specular")["a"]);
        material.setEmission(value.get("emission")["r"], value.get("emission")["g"], value.get("emission")["b"], value.get("emission")["a"]);
        material.setShininess(value.get("shininess"));

        map[key] = material;
      }
    }.bind(this));
  }

  setupTextures() {
    this.textures.forEach(function (value, key, map) {
      let texture = new CGFtexture(this.scene, "./scenes/" + value.get("file"));
      map[key] = [texture, value.get("amplif_factor")["s"], value.get("amplif_factor")["t"]];
    }.bind(this));
  }

  //TODO is there a better way to do this? 6 parameters is a very nasty code smell
  setupStatics(node_id, mat, text, table, seat, was_static) {
    let node = this.nodes.get(node_id),
      is_static = (node.get("static") || was_static),
      is_pickable = node.get("pickable"),
      children = node.get("descendants")[0],
      leaves = node.get("descendants")[1];

    if (node.get("material") !== "null" && node.get("material") !== undefined)
      mat = node.get("material");
    if (node.get("texture") !== "null" && node.get("texture") !== undefined)
      text = node.get("texture");

    let arr;
    if (table === -1 && (arr = table_regex.exec(node_id)) !== null)
      table = parseInt(arr[1]);
    if (seat === -1 && (arr = seat_regex.exec(node_id)) !== null)
      seat = parseInt(arr[1]);

    this.scene.pushMatrix();
    this.scene.multMatrix(node.get("matrix"));

    for (let i = 0; i < children.length; i++)
      this.setupStatics(children[i], mat, text, table, seat, is_static);

    for (let i = 0; is_static && i < leaves.length; i++) {
      let leaf_args = [this.scene.getMatrix(), this.materials[mat], this.textures[text]],
        leaf = new StaticLeaf(this.scene, leaves[i]["type"], leaves[i]["args"], leaf_args),
        is_token = (table !== -1 && seat !== -1);

      if (is_pickable && is_token) {
        this.tokens[table * 10 + seat + 1] = leaf;
        leaf.setPickable(table * 10 + seat + 1);
      }
      this.statics.push(leaf);
    }
    this.scene.popMatrix();
  }

  clipStaticNodes(node) {
    let is_static = node.get("static");
    node.get("descendants")[0].forEach(function (value, key, obj) {
      if (this.nodes.get(value).get("static") || is_static)
        obj[key] = null;
      else
        this.clipStaticNodes(this.nodes.get(value))

    }.bind(this));
  }

  setupNodes() {
    this.nodes.forEach(function (value, key, map) {
      let node = new GraphNode(key, value.get("pickable")),
        animations = value.get("animations"),
        descendants = value.get("descendants");

      for (let i = 0; animations !== undefined && i < animations.length; i++)
        node.addAnimation(this.animations[animations[i]]);

      for (let i = 0; descendants !== undefined && i < descendants[0].length; i++) {
        if (descendants[0][i] !== null)
          node.addChild(descendants[0][i]);
      }

      for (let i = 0; descendants !== undefined && i < descendants[1].length; i++) {
        let leaf = new DynamicLeaf(this.scene, descendants[1][i]["type"], descendants[1][i]["args"]);
        if (node.isPickable())
          leaf.setPickable();

        node.addLeaf(leaf);
      }


      node.transformMatrix = value.get("matrix");
      node.materialID = value.get("material");
      node.textureID = value.get("texture");

      map[key] = node;
    }.bind(this));
  }

  /**
   * @description Called when there is an error to report
   */
  onXMLError(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
  }

  /**
   * @description Called when there is a warning to report
   */
  onXMLMinorError(message) {
    console.warn("Warning: " + message);
  }

  /**
   * @description Called when there is a simple log to report
   */
  log(message) {
    console.log("   " + message);
  }

  /**
   * @description Generates a default material with a random name
   */
  generateDefaultMaterial() {
    var materialDefault = new CGFappearance(this.scene);
    materialDefault.setShininess(1);
    materialDefault.setSpecular(0, 0, 0, 1);
    materialDefault.setDiffuse(0.5, 0.5, 0.5, 1);
    materialDefault.setAmbient(0, 0, 0, 1);
    materialDefault.setEmission(0, 0, 0, 1);

    // Generates random material ID not currently in use.
    this.defaultMaterialID = null;
    do this.defaultMaterialID = this.generateRandomString(5);
    while (this.materials[this.defaultMaterialID] != null);

    this.materials[this.defaultMaterialID] = materialDefault;
  }

  /**
   * @description Generates a random string of specified legth
   * @param length Length of the string to generate
   * @return Generated string
   */
  generateRandomString(length) {
    // Generates an array of random integer ASCII codes of the specified length
    // and returns a string of the specified length.
    var numbers = [];
    for (var i = 0; i < length; i++)
      numbers.push(Math.floor(Math.random() * 256)); // Random ASCII code.

    return String.fromCharCode.apply(null, numbers);
  }

  updateTokenTexture(table, seat, token_chr) {
    let text_name = tokens_prop[token_chr],
      text = this.textures[text_name];
    console.log("Texture name = " + text_name);
    if (text !== null && text !== undefined)
      this.tokens[table * 10 + seat + 1].setTexture(text);
    else
      console.log("No texture associated with token: " + token_chr);
  }

  displayScene() {
    let root = this.nodes[this.root_id];
    this.displayStatics();
    this.displayDynamics(root, root.materialID, root.textureID, root.selectable);
  }

  //TODO check way to change mat/text of specific leaves (assign ID's to them?)
  displayStatics() {
    for (let i = 0; i < this.statics.length; i++)
      this.statics[i].render();
  }

  /**
   * @description Used to start rendering the scene, handles only the root node
   */
  displayDynamics(node, mat, text, sel) {
    var children = node.children,
      leaves = node.leaves,
      real_sel = node.selectable || sel;

    this.scene.pushMatrix();
    this.scene.multMatrix(node.transformMatrix);
    this.scene.multMatrix(node.applyAnimations());

    if (node.materialID != "null")
      mat = node.materialID;

    if (node.textureID != "null")
      text = node.textureID;

    for (var i = 0; i < node.children.length; i++)
      this.displayDynamics(this.nodes[node.children[i]], mat, text, real_sel);
    for (var i = 0; i < node.leaves.length; i++)
      node.leaves[i].render(this.materials[mat], (text == "clear" ? null : this.textures[text]), this.scene);

    this.scene.popMatrix();
  }
};
