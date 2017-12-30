let tokens_prop = {
  'X': "player1_text",
  'O': "player2_text",
  '@': "player2_waiter_text",
  '%': "player2_waiter_text",
  'W': "waiter_text",
  '.': "empty_cell_text"
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

let specials_prop = {
  0: "spec_mv_green",
  1: "spec_mv_black",
  2: "spec_mv_wait_green",
  3: "spec_mv_wait_black",
  4: "spec_rotate",
  5: "spec_rotate",
  6: "spec_swp_unc",
  7: "spec_swp_claimed",
}

let table_regex = /table(\d)$/;
let seat_regex = /seat(\d)$/;
let special_regex = /special(\d)$/;

class SceneGraph {
  /**
   * @description Contructor for SceneGraph
   * @param file_name Name of the xml file to open
   * @param scene Scene to render the graph
   */
  constructor(scene) {
    this.loadedOk = null;
    this.start_time = 0;
    this.xml_n = 0;
    // Establish bidirectional references between scene and graph.
    this.scene = scene;
    scene.graph = this;

    this.materials = [];
    this.textures = [];
    this.animations = [];

    this.statics = [];
    this.nodes = [];
    this.tokens = [];
    this.specials = [];
    this.root_ids = [];
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
    let parser = new GraphParser(this.reader),
      texts, mats, anims;

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
    if ((texts = parser.parseTextures()) === null) {
      console.error("parseTextures() failed!\n");
      return null;
    }
    if ((mats = parser.parseMaterials()) === null) {
      console.error("parseMaterials() failed!\n");
      return null;
    }
    if ((anims = parser.parseAnimations()) === null) {
      console.error("parseAnimations() failed!\n");
      return null;
    }

    let nodes_ret;
    if ((nodes_ret = parser.parseNodes()) === null)
      return null;
    let root_id = nodes_ret[0],
      nodes = nodes_ret[1];

    this.root_ids.push([root_id]);

    this.setupMaterials(mats);
    this.setupTextures(texts);
    this.setupAnimations(anims);

    this.scene.pushMatrix();
    mat4.identity(this.scene.activeMatrix);

    let root = nodes.get(root_id);
    this.setupStatics(nodes, root_id, root.get("material"), root.get("texture"), -1, -1, -1, root.get("static"));
    this.scene.popMatrix();
    this.clipStaticNodes(nodes, nodes.get(root_id));
    this.nodes[root_id] = nodes;

    this.setupNodes(root_id);
    console.log("Loaded OK\n");
    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
  }

  setupAnimations(animations) {
    let combo_anims = [];
    animations.forEach(function (value, key) {
      let type = value.get("type");
      let anim = anim_parser[type](value.get("speed"), value.get("args"));
      if (type === "combo")
        combo_anims.push(anim);

      if (this.animations[key] === undefined)
        this.animations[key] = anim;
      else
        throw new Error("Animations ID must be different! (conflict ID = " + key + ")");
    }.bind(this));
    //TODO its possible combo animations are not well defined!
    combo_anims.forEach(function (value, key, map) {
      value.setAnimations(this.animations);
    })
  }

  setupMaterials(materials) {
    materials.forEach(function (value, key) {
      if (value !== null && value !== undefined) {
        let material = new CGFappearance(this.scene);
        material.setAmbient(value.get("ambient")["r"], value.get("ambient")["g"], value.get("ambient")["b"], value.get("ambient")["a"]);
        material.setDiffuse(value.get("diffuse")["r"], value.get("diffuse")["g"], value.get("diffuse")["b"], value.get("diffuse")["a"]);
        material.setSpecular(value.get("specular")["r"], value.get("specular")["g"], value.get("specular")["b"], value.get("specular")["a"]);
        material.setEmission(value.get("emission")["r"], value.get("emission")["g"], value.get("emission")["b"], value.get("emission")["a"]);
        material.setShininess(value.get("shininess"));

        if (this.materials[key] === undefined)
          this.materials[key] = material;
        else
          throw new Error("Materials ID must be different! (conflict ID = " + key + ")")
      }
    }.bind(this));
  }

  setupTextures(textures) {
    textures.forEach(function (value, key) {
      let texture = new CGFtexture(this.scene, "./scenes/" + value.get("file"));

      if (this.textures[key] === undefined)
        this.textures[key] = [texture, value.get("amplif_factor")["s"], value.get("amplif_factor")["t"]];
      else
        throw new Error("Textures ID must be different! (conflict ID = " + key + ")");
    }.bind(this));
  }

  //TODO is there a better way to do this? 8 parameters is a very nasty code smell
  setupStatics(nodes, node_id, mat, text, table, seat, special, was_static) {
    let node = nodes.get(node_id),
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
    if (special === -1 && (arr = special_regex.exec(node_id)) !== null)
      special = parseInt(arr[1]);

    this.scene.pushMatrix();
    this.scene.multMatrix(node.get("matrix"));

    for (let i = 0; i < children.length; i++)
      this.setupStatics(nodes, children[i], mat, text, table, seat, special, is_static);

    for (let i = 0; is_static && i < leaves.length; i++) {
      let leaf_args = [this.scene.getMatrix(), this.materials[mat], this.textures[text]],
        leaf = new StaticLeaf(this.scene, leaves[i]["type"], leaves[i]["args"], leaf_args);

      this.checkSpecial(special, leaf);
      if (!this.checkToken(is_pickable, table, seat, leaf)) //if it is a token it goes into this.tokens
        this.statics.push(leaf);

    }
    this.scene.popMatrix();
  }

  checkToken(is_pickable, table_n, seat_n, leaf) {
    if (is_pickable && table_n !== -1 && seat_n !== -1) {
      let id = table_n * 10 + seat_n + 1;
      if (this.tokens[id] === null || this.tokens[id] === undefined) {
        this.tokens[id] = [];
      }
      this.tokens[id].push(leaf);
      return true;
    }
    return false;
  }

  checkSpecial(special, leaf) {
    if (special !== -1) {
      this.specials[special] = leaf;
    }
  }

  clipStaticNodes(nodes, node) {
    let is_static = node.get("static");
    node.get("descendants")[0].forEach(function (value, key, obj) {
      if (nodes.get(value).get("static") || is_static)
        obj[key] = null;
      else
        this.clipStaticNodes(nodes.get(value))

    }.bind(this));
  }

  setupNodes(root_id) {
    this.nodes[root_id].forEach(function (value, key, map) {
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

  updateTokens(board) {
    let table_n = 0;
    for (; table_n < board.length - 1; table_n++) {
      for (let seat_n = 0; seat_n < board[table_n].length; seat_n++) {
        let text = this.textures[tokens_prop[board[table_n][seat_n]]];

        //Cup animation start here

        // this.tokens[table_n * 10 + seat_n + 1].setTexture(text);
      }
    }

    for (let i = 0; i < board[table_n].length; i++) {
      let spec_number = parseInt(board[table_n][i]),
        text2 = this.textures[specials_prop[spec_number]];

      this.specials[spec_number].setTexture(text2);
    }

  }

  displayScene() {
    this.displayStatics();

    this.root_ids.forEach(function (value, key) {
      let root = this.nodes[value][value];
      this.displayDynamics(this.nodes[root], root, root.materialID, root.textureID, root.selectable);
    }.bind(this));
  }

  //TODO check way to change mat/text of specific leaves (assign ID's to them?)
  displayStatics() {
    for (let i = 0; i < this.statics.length; i++)
      this.statics[i].render();

    this.tokens.forEach(function (value, key) {
      this.scene.registerForPick(key, value[0].getPrimitive());

      for (let i = 0; i < value.length; i++)
        value[i].render();

      this.scene.clearPickRegistration();
    }.bind(this));
  }

  /**
   * @description Used to start rendering the scene, handles only the root node
   */
  displayDynamics(nodes, node, mat, text, sel) {
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
      this.displayDynamics(nodes, nodes[node.children[i]], mat, text, real_sel);
    for (var i = 0; i < node.leaves.length; i++)
      node.leaves[i].render(this.materials[mat], (text == "clear" ? null : this.textures[text]), this.scene);

    this.scene.popMatrix();
  }
};
