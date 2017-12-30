let leaves_types = ["circle", "rectangle", "triangle", "patch", "cylinder", "sphere", "wave_obj"];

let initials_req = ["frustum", "reference"];
let illumins_req = ["ambient", "background"];
let lights_req = ["enable", "position", "ambient", "diffuse", "specular"];
let texture_req = ["file", "amplif_factor"];
let material_req = ["shininess", "specular", "diffuse", "ambient", "emission"];
let nodes_req = ["material", "texture", "descendants"];

let node_infos = ["id", "static", "pickable"];
let node_needed_infos = ["id"];
let node_optional_infos = ["static", "pickable"];

class GraphParser {
  constructor(reader) {
    this.reader = reader;
    this.axisCoords = {
      'x': [1, 0, 0],
      'y': [0, 1, 0],
      'z': [0, 0, 1]
    };

    this.parseNodeOptionals = function (node) {
      let values = new Map();

      for (let i = 0; i < node_optional_infos.length; i++) {
        let info_name = node_optional_infos[i],
          info = null;
        if (this.reader.hasAttribute(node, info_name))
          info = this.reader.getBoolean(node, info_name);
        else
          info = false;

        values.set(info_name, info);
      }

      return values;
    };

    this.hasKey = function (obj, key, msg) {
      if (!obj.hasOwnProperty(key)) {
        if (msg !== undefined && msg !== null)
          console.error(msg);
        return false;
      }
      return true;
    };

    this.parseRGBA = function (spec, msg) {
      let r = this.reader.getFloat(spec, 'r', "No component R found in RGBA!"),
        g = this.reader.getFloat(spec, 'g', "No component G found in RGBA!"),
        b = this.reader.getFloat(spec, 'b', "No component B found in RGBA!"),
        a = this.reader.getFloat(spec, 'a', "No component A found in RGBA!"),
        r_ok = (r !== null && !isNaN(r) && r >= 0 && r <= 1),
        g_ok = (g !== null && !isNaN(g) && g >= 0 && g <= 1),
        b_ok = (b !== null && !isNaN(b) && b >= 0 && b <= 1),
        a_ok = (a !== null && !isNaN(a) && a >= 0 && a <= 1);

      if (!r_ok || !g_ok || !b_ok || !a_ok) {
        console.error(msg);
        return null;
      }

      return {
        "r": r,
        "g": g,
        "b": b,
        "a": a
      };
    };

    this.parseLightPosition = function (spec, msg) {
      let xyz = this.parseXYZ(spec, "Error extracting light position!"),
        w = this.reader.getFloat(spec, 'w', "No component W found in Light position!");
      if (xyz === null || w === null || isNaN(w)) {
        console.error(msg);
        return null;
      }
      xyz['w'] = w;
      return xyz;
    };
    //TODO change controlpoints 'xx' and 'yy' into 'x' and 'y'
    this.parseXYZ = function (spec, msg) {
      let x = this.reader.getFloat(spec, 'x', "No X component found in XYZ!"),
        y = this.reader.getFloat(spec, 'y', "No Y component found in XYZ!"),
        z = this.reader.getFloat(spec, 'z', "No Z component found in XYZ!"),
        all_ok = (x !== null && y !== null && z !== null && !isNaN(x) && !isNaN(y) && !isNaN(z));

      if (!all_ok) {
        console.error(msg);
        return null;
      }
      return {
        'x': x,
        'y': y,
        'z': z
      };
    };

    this.parseRotation = function (spec, msg) {
      let axis = this.reader.getItem(spec, 'axis', ["x", "y", "z"], "No axis found in rotation!"),
        angle = this.reader.getFloat(spec, 'angle', "No angle found in rotation!"),
        all_ok = (axis !== null && angle !== null && !isNaN(angle));

      if (!all_ok) {
        console.error(msg);
        return null;
      }
      return {
        'axis': axis,
        'angle': angle
      };
    };

    this.parseScaling = function (spec, msg) {
      let sx = this.reader.getFloat(spec, 'sx', "No X component found in scale!"),
        sy = this.reader.getFloat(spec, 'sy', "No Y component found in scale!"),
        sz = this.reader.getFloat(spec, 'sz', "No Z component found in scale!"),
        all_ok = (sx !== null && sy !== null && sz !== null && !isNaN(sx) && !isNaN(sy) && !isNaN(sz));

      if (!all_ok) {
        console.error(msg);
        return null;
      }
      return {
        'sx': sx,
        'sy': sy,
        'sz': sz
      };
    };

    this.parseFrustum = function (spec, msg) {
      let near = this.reader.getFloat(spec, 'near', "No component 'near' found in frustum!"),
        far = this.reader.getFloat(spec, 'far', "No component 'far' found in frustum!");
      if (near === null || isNaN(near)) {
        console.log("	assuming near = 0.1");
        near = 0.1;
      }
      if (far === null || isNaN(far)) {
        console.log("	assuming far = 500");
        far = 500;
      }

      return {
        'near': near,
        'far': far
      };
    }.bind(this)

    this.parseTextureSpec = {
      "file": function (spec, text_id) {
        let file = this.reader.getString(spec, 'path', "No texture file specified! (Texture ID = " + text_id + ")");
        if (file === null)
          return null;

        return ["file", file];
      }.bind(this),
      "amplif_factor": function (spec, text_id) {
        let s = this.reader.getFloat(spec, 's', "No texture amplif_factor s defined! (Texture ID = " + text_id + ")"),
          t = this.reader.getFloat(spec, 't', "No texture amplif_factor t defined! (Texture ID = " + text_id + ")");

        if (s === null || t === null || isNaN(s) || isNaN(t))
          return null;

        return ["amplif_factor", {
          "s": s,
          "t": t
				}];
      }.bind(this)
    }

    this.parseMaterialSpec = {
      "shininess": function (spec, mat_id) {
        let shine = this.reader.getFloat(spec, 'value', "No shininess defined for material! (Material ID = " + mat_id + "), assuming shininess = 1");
        if (shine === null)
          shine = 1;
        return ["shininess", shine];
      }.bind(this),
      "specular": function (spec, mat_id) {
        let rgba = this.parseRGBA(spec, "Material specular rgba parse error! (Material ID = " + mat_id + ")");
        if (rgba === null)
          return null;

        return ["specular", rgba];
      }.bind(this),
      "diffuse": function (spec, mat_id) {
        let rgba = this.parseRGBA(spec, "Material diffuse rgba parse error! (Material ID = " + mat_id + ")");
        if (rgba === null)
          return null;

        return ["diffuse", rgba];
      }.bind(this),
      "ambient": function (spec, mat_id) {
        let rgba = this.parseRGBA(spec, "Material ambient rgba parse error! (Material ID = " + mat_id + ")");
        if (rgba === null)
          return null;

        return ["ambient", rgba];
      }.bind(this),
      "emission": function (spec, mat_id) {
        let rgba = this.parseRGBA(spec, "Material emission rgba parse error! (Material ID = " + mat_id + ")");
        if (rgba === null)
          return null;

        return ["emission", rgba];
      }.bind(this)
    }

    this.parseNodeSpec = {
      "MATERIAL": function (node_id, spec) {
        let mat_id = this.reader.getString(spec, 'id');
        if (mat_id === null) {
          console.error("Cannot parse material ID (node ID = " + node_id + ")");
          return null;
        }

        return ["material", mat_id];
      }.bind(this),
      "TEXTURE": function (node_id, spec) {
        let text_id = this.reader.getString(spec, 'id');
        if (text_id === null) {
          console.error("Cannot parse texture ID (node ID = " + node_id + ")");
          return null;
        }

        return ["texture", text_id];
      }.bind(this),
      "TRANSLATION": function (node_id, spec) {
        let xyz = this.parseXYZ(spec, "Parse error on translation of node ID = " + node_id),
          mat = mat4.create();
        if (xyz !== null)
          mat4.translate(mat, mat, [xyz['x'], xyz['y'], xyz['z']]);

        return mat;
      }.bind(this),
      "ROTATION": function (node_id, spec) {
        let rot = this.parseRotation(spec, "Parse error on rotation of node ID = " + node_id),
          mat = mat4.create();
        if (rot !== null)
          mat4.rotate(mat, mat, rot['angle'] * DEGREE_TO_RAD, this.axisCoords[rot['axis']]);

        return mat;
      }.bind(this),
      "SCALE": function (node_id, spec) {
        let scale = this.parseScaling(spec, "Parse error on scale of node ID = " + node_id),
          mat = mat4.create();
        if (scale !== null)
          mat4.scale(mat, mat, [scale['sx'], scale['sy'], scale['sz']]);

        return mat;
      }.bind(this),
      "ANIMATIONREFS": function (node_id, spec) {
        let anim_childs = spec.children,
          anim_ids = [];
        for (let i = 0; i < anim_childs.length; i++) {
          let anim_id = this.reader.getString(anim_childs[i], 'id');
          if (anim_id !== null)
            anim_ids.push(anim_id);
          else
            console.log("Animationref #" + i + " of node ID = " + node_id + " has no id defined! Discarding");
        }

        return ["animations", anim_ids];
      }.bind(this),
      "DESCENDANTS": function (node_id, spec) {
        let children = spec.children,
          descendants = [[], []];
        for (let i = 0; i < children.length; i++) {
          let descendant = children[i],
            result = this.parseDescendants[descendant.nodeName](node_id, descendant);
          if (result !== null)
            descendants[result[0]].push(result[1]);
          else
            console.log("	ignoring descendant");
        }
        return ["descendants", descendants];
      }.bind(this)
    }

    this.parseDescendants = {
      "NODEREF": function (node_id, spec) {
        let id = this.reader.getString(spec, 'id', "No ID found in NODEREF of node ID = " + node_id);
        if (id === null)
          return null;

        return [0, id];
      }.bind(this),
      "LEAF": function (node_id, spec) {
        let type = this.reader.getItem(spec, 'type', leaves_types, "Unknown type of leaf in node ID = " + node_id),
          args = this.reader.getString(spec, 'args', "No field 'args' found in leaf of node ID = " + node_id).split(' ');

        if (type === null || args === null)
          return null;

        args.forEach(function (value, key, obj) {
          //obj[key] = parseInt(value);
          obj[key] = value;
        });

        return [1, {
          "type": type,
          "args": args
        }];
      }.bind(this)
    };

    this.parseAnimationSpecs = {
      "linear": function (node, id) {
        let speed = this.reader.getFloat(node, 'speed', "No speed defined! (animation ID = " + node.nodeName + "), assuming speed = 1");
        if (speed === null || isNaN(speed))
          speed = 1;
        return this.parseLinearAnimation(node, id, speed);
      }.bind(this),
      "circular": function (node, id) {
        let speed = this.reader.getFloat(node, 'speed', "No speed defined! (animation ID = " + node.nodeName + "), assuming speed = 1");
        if (speed === null || isNaN(speed))
          speed = 1;
        return this.parseCircularAnimation(node, id, speed);
      }.bind(this),
      "bezier": function (node, id) {
        let speed = this.reader.getFloat(node, 'speed', "No speed defined! (animation ID = " + node.nodeName + "), assuming speed = 1");
        if (speed === null || isNaN(speed))
          speed = 1;
        return this.parseBezierAnimation(node, id, speed);
      }.bind(this),
      "combo": function (node, id) {
        return this.parseComboAnimation(node, id);
      }.bind(this)
    };

    this.parseIlluminationSpecs = {
      "ambient": function (spec) {
        let ret = this.parseRGBA(spec, "Parse error on illumination ambient");
        if (ret !== null)
          return ["ambient", ret];

        return null;
      }.bind(this),
      "background": function (spec) {
        let ret = this.parseRGBA(spec, "Parse error on illumination background");
        if (ret !== null)
          return ["background", ret];

        return null;
      }.bind(this)
    }

    this.parseInitialsSpecs = {
      "frustum": function (spec) {
        let ret = this.parseFrustum(spec, "Parse error on Initials frustum");
        if (ret !== null) {
          return ["frustum", ret];
        }
        return null;
      }.bind(this),
      "translation": function (spec) {
        let xyz = this.parseXYZ(spec, "Parse error on Initials translation"),
          mat = mat4.create();
        if (xyz !== null)
          mat4.translate(mat, mat, [xyz['x'], xyz['y'], xyz['z']]);

        return mat;
      }.bind(this),
      "rotation": function (spec) {
        let rot = this.parseRotation(spec, "Parse error on rotation of initials"),
          mat = mat4.create();
        if (rot !== null)
          mat4.rotate(mat, mat, rot['angle'] * DEGREE_TO_RAD, this.axisCoords[rot['axis']]);

        return mat;
      }.bind(this),
      "scale": function (spec) {
        let scale = this.parseScaling(spec, "Parse error on scale of intials"),
          mat = mat4.create();
        if (scale !== null)
          mat4.scale(mat, mat, [scale['sx'], scale['sy'], scale['sz']]);

        return mat;
      }.bind(this),
      "reference": function (spec) {
        let length = this.reader.getFloat(spec, 'length');
        if (length === null || isNaN(length) || length <= 0) {
          console.log("Error on Initials reference parse! assuming length = 0");
          length = 1;
        }

        return ["reference", length];
      }.bind(this)
    }

    this.parseLightsSpecs = {
      "enable": function (spec, light_id) {
        let value = this.reader.getBoolean(spec, 'value', "No spec 'value' in light " + light_id);
        if (value === null) {
          console.error("Failed to parse Light enable spec!");
          return null;
        }
        return ["enable", value];
      }.bind(this),
      "position": function (spec, light_id) {
        let xyzw = this.parseLightPosition(spec, null);
        if (xyzw === null)
          return null;

        return ["position", xyzw];
      }.bind(this),
      "ambient": function (spec, light_id) {
        let rgba = this.parseRGBA(spec, "Parse error on light " + light_id + " ambient component!");
        if (rgba === null)
          return null;

        return ["ambient", rgba];
      }.bind(this),
      "diffuse": function (spec, light_id) {
        let rgba = this.parseRGBA(spec, "Parse error on light " + light_id + " diffuse component!");
        if (rgba === null)
          return null;

        return ["diffuse", rgba];
      }.bind(this),
      "specular": function (spec, light_id) {
        let rgba = this.parseRGBA(spec, "Parse error on light " + light_id + " specular component!");
        if (rgba === null)
          return null;

        return ["specular", rgba];
      }.bind(this)
    }
  }

  parseInitials() {
    let node, values = new Map(),
      matrix = mat4.create();
    if ((node = this.getLSXNode("INITIALS")) === null)
      return null;

    let children = node.children;
    for (let i = 0; i < children.length; i++) {
      let name = children[i].nodeName,
        ret;
      if (!this.hasKey(this.parseInitialsSpecs, name, "Initials spec '" + name + "' not valid!") ||
        (ret = this.parseInitialsSpecs[name](children[i])) == null)
        return null;

      if (name === "translation" || name === "scale" || name == "rotation")
        mat4.mul(matrix, matrix, ret);
      else
        values.set(ret[0], ret[1]);
    }
    values.set("matrix", matrix);
    if (!this.hasRequiredKeys(values, initials_req, "Initials has no: "))
      return null;

    console.log("Parsed Initials");
    return values;
  }

  parseIllumination() {
    let node, values = new Map();
    if ((node = this.getLSXNode("ILLUMINATION")) === null)
      return null;
    let children = node.children;

    for (let i = 0; i < children.length; i++) {
      let spec = children[i].nodeName,
        ret;

      if (!this.hasKey(this.parseIlluminationSpecs, spec, "Illumination spec '" + spec + "' not valid!") ||
        (ret = this.parseIlluminationSpecs[spec](children[i])) == null)
        return null;

      values.set(ret[0], ret[1]);
    }

    if (!this.hasRequiredKeys(values, illumins_req, "Illumination has no: "))
      return null;

    console.log("Parsed illumination");
    return values;
  }

  parseLights() {
    let node, ret = new Map(),
      num_lights = 0;
    if ((node = this.getLSXNode("LIGHTS")) === null)
      return null;
    let children = node.children;

    for (let i = 0; i < children.length; i++, num_lights++) {
      if (children[i].nodeName != "LIGHT") {
        console.log("unknown tag <" + children[i].nodeName + ">");
        continue;
      }

      let id = this.reader.getString(children[i], 'id');
      if (id == null) {
        console.error("no ID defined for light");
        return null;
      }

      if (ret[id] != null) { //repeated light id's
        console.log("ID must be unique for each light (conflict: ID = " + id + "), ignoring");
        continue;
      }

      let grand_children = children[i].children,
        light_values = new Map();
      for (var j = 0; j < grand_children.length; j++) {
        let parsed_ret, name = grand_children[j].nodeName;
        if (!this.hasKey(this.parseLightsSpecs, name, "Light spec '" + name + "' not valid! (light ID = " + id + ")") ||
          (parsed_ret = this.parseLightsSpecs[name](grand_children[j])) == null)
          return null;

        light_values.set(parsed_ret[0], parsed_ret[1]);
      }

      if (!this.hasRequiredKeys(light_values, lights_req, "Light " + id + " has no: "))
        return null;
      ret.set(id, light_values);
    }

    if (num_lights == 0 || num_lights > 8) {
      console.error("Number of defined lights is incorrect! " + num_lights + " where defined but number must be within [1,8]");
      return null;
    }

    console.log("Parsed lights");
    return ret;
  }

  parseTextures() {
    let node, values = new Map();
    if ((node = this.getLSXNode("TEXTURES")) === null)
      return null;

    let textures = node.children;
    for (let i = 0; i < textures.length; i++) {
      let texture = textures[i],
        id = this.reader.getString(texture, 'id', "No ID defined for texture#" + i);
      if (id === null)
        return null;
      if (this.hasKey(values, id)) {
        console.error("Duplicate texture ID (conflict ID = " + id + ")");
        return null;
      }

      let specs = texture.children,
        text_specs = new Map();
      for (let j = 0; j < specs.length; j++) {
        let ret, spec_name = specs[j].nodeName;
        if ((ret = this.parseTextureSpec[spec_name](specs[j], id)) === null)
          return null;

        text_specs.set(ret[0], ret[1]);
      }
      if (!this.hasRequiredKeys(text_specs, texture_req, "Texture " + id + " has no: "))
        return null;

      values.set(id, text_specs);
    }

    return values;
  }

  parseMaterials() {
    let node, values = new Map();
    if ((node = this.getLSXNode("MATERIALS")) === null)
      return null;

    let materials = node.children;
    for (let i = 0; i < materials.length; i++) {
      let material = materials[i],
        id = this.reader.getString(material, 'id', "No ID defined for material#" + i);

      if (id === null)
        return null;
      if (this.hasKey(values, id)) {
        console.log("Duplicate material ID (conflict ID = " + id + ")");
        return null;
      }

      let specs = material.children,
        mat_specs = new Map();
      for (let j = 0; j < specs.length; j++) {
        let ret, spec_name = specs[j].nodeName;
        if ((ret = this.parseMaterialSpec[spec_name](specs[j], id)) === null)
          return null;

        mat_specs.set(ret[0], ret[1]);
      }
      if (!this.hasRequiredKeys(mat_specs, material_req, "Texture " + id + " has no: "))
        return null;

      values.set(id, mat_specs);
    }

    return values;
  }

  parseAnimations() {
    let node, animations = new Map();
    if ((node = this.getLSXNode("ANIMATIONS")) === null)
      return null;
    let anims = node.children;
    for (let i = 0; i < anims.length; i++) {
      let animation = anims[i],
        anim_speed = 0,
        ret;
      if (animation.nodeName !== "ANIMATION") {
        console.log("unknown tag name <" + animation.nodeName + ">");
        continue;
      }

      let id = this.reader.getString(animation, 'id'),
        type = this.reader.getString(animation, 'type');

      if (id === null || type === null) {
        console.error("Header of animation is incorrect! (#" + i + ")");
        return null;
      }
      if (this.hasKey(animations, id)) {
        console.error("ID for animation must be unique: (conflict: " + id + ")");
        return null;
      }

      if (!this.hasKey(this.parseAnimationSpecs, type, "Unknown animation type '" + type + "' (animation ID " + id + ")") ||
        (ret = this.parseAnimationSpecs[type](animation, id)) == null)
        return null;

      animations.set(id, ret);
    }
    console.log("Parsed Animations");
    return animations;
  }

  /**
   * @description Parses the Linear animation block
   * @param animation_node The root node of the animations
   * @param id The id node of the animation
   * @param speed The speed of the animation
   * @return null if there was an error, error message otherwise
   */
  parseLinearAnimation(node, id, speed) {
    let ret = new Map();
    let control_points = node.children;
    ret.set("speed", speed);
    ret.set("type", "linear");
    if (control_points.length < 2) {
      console.error("At least 2 controlpoints must be defined for linear animation: " + id);
      return null;
    }

    let pts;
    if ((pts = this.parseControlPoints(node)) === null)
      return null;
    ret.set("args", pts);
    return ret;
  }

  /**
   * @description Parses the Circular animation block
   * @param animation_node The root node of the animations
   * @param id The id node of the animation
   * @param speed The speed of the animation
   * @return null if there was no error, error message otherwise
   */
  parseCircularAnimation(animation_node, id, speed) {
    let centerx = this.reader.getFloat(animation_node, 'centerx'),
      centery = this.reader.getFloat(animation_node, 'centery'),
      centerz = this.reader.getFloat(animation_node, 'centerz'),
      radius = this.reader.getFloat(animation_node, 'radius'),
      startang = this.reader.getFloat(animation_node, 'startang'),
      rotang = this.reader.getFloat(animation_node, 'rotang'),
      parsed = (centerx === null || centery === null || centerz === null || radius === null || startang === null || rotang === null);
    if (!parsed) {
      console.log("Failed to parse circular animation specs! (animation ID " + id + ")");
      return null;
    }

    return {
      "type": "circular",
      "args": [centerx, centery, centerz, radius, startang, rotang]
    };
  }

  /**
   * @description Parses the Bezier animation block
   * @param animation_node The root node of the animations
   * @param id The id node of the animation
   * @param speed The speed of the animation
   * @return null if there was no error, error message otherwise
   */
  parseBezierAnimation(animation_node, id, speed) {
    let ret = new Map(),
      cpts = node.children;
    ret.set("speed", speed);
    ret.set("type", "bezier");
    if (children.length != 4) {
      console.error("Only 4 points may be defined for bezier animation: " + id);
      return null;
    }

    let pts;
    if ((pts = this.parseControlPoints(cpts)) === null)
      return null;

    ret.set("args", pts);
    return ret;
  }

  /**
   * @description Parses the Combo animation block
   * @param animation_node The root node of the animations
   * @param id The id node of the animation
   * @return null if there was no error, error message otherwise
   */
  parseComboAnimation(animation_node, id) {
    let children = animation_node.children,
      anims = [];
    if (children.length == 0) {
      console.error("At least one animation must be specified in combo animation! (animation ID " + id + ")");
      return null;
    }

    for (i = 0; i < children.length; i++) {
      let child = children[i];
      if (child.nodeName != "SPANREF") {
        console.log("unknown combo animation tag#" + i + " name <" + child.nodeName + ">");
        return null;
      }
      let anim_id = this.reader.getString(child, 'id');
      if (anim_id === null) {
        console.error("No animation id defined in combo animation: " + id);
        return null;
      }

      anims.push(anim_id);
    }

    return {
      "type": "combo",
      "args": anims
    };
  }

  parseControlPoints(node) {
    let cpts = node.children,
      pts = [];
    for (let i = 0; i < cpts.length; i++) {
      let cpt = cpts[i];
      if (cpt.nodeName != "controlpoint") {
        console.log("Unknown animation tag name <" + cpt.nodeName + ">, aborting");
        return null;
      }

      let pt;
      if ((pt = this.parseXYZ(cpt, "Parse error on controlpoint #" + i + " of animation: " + node.nodeName)) === null)
        return null;
      pts.push(pt);
    }

    return pts;
  }

  parseNodes() {
    let node, nodes, root_id = null,
      values = new Map();

    if ((node = this.getLSXNode("NODES")) === null)
      return null;

    for (let i = 0, nodes = node.children; i < nodes.length; i++) {
      node = nodes[i];
      let node_name = node.nodeName;
      if (node_name === "ROOT") {
        if (root_id !== null) {
          console.error("There can only be one root node!");
          return null;
        }
        else if ((root_id = this.reader.getString(nodes[i], 'id')) === null) {
          console.error("Failed to retrieve root node ID!");
          return null;
        }
      }
      else if (node_name === "NODE") {
        let node_id = this.reader.getString(node, 'id'),
          node_infos = this.parseNodeOptionals(node);

        if (node_id === null || node_id === undefined) {
          console.error("Node #" + i + " must have an ID!");
          return null;
        }
        if (this.hasKey(values, node_infos["id"])) {
          console.error("Node ID must be unique! (conflict: ID = " + node_infos["id"] + ")");
          return null;
        }

        let specs = node.children,
          matrix = mat4.create();
        for (let j = 0; j < specs.length; j++) { //Parses node specifications
          let spec = specs[j],
            spec_name = spec.nodeName,
            spec_ret;
          if (!this.hasKey(this.parseNodeSpec, spec_name, "Unknown node spec: '" + spec_name + "' (node ID = " + node_id + ")") ||
            (spec_ret = this.parseNodeSpec[spec_name](node_id, spec)) === null)
            return null;

          if (spec_name === "TRANSLATION" || spec_name === "ROTATION" || spec_name === "SCALE")
            mat4.mul(matrix, matrix, spec_ret);
          else
            node_infos.set(spec_ret[0], spec_ret[1]);
        }

        node_infos.set("matrix", matrix);
        if (!this.hasRequiredKeys(node_infos, nodes_req, "Node " + node_id + " has no: "))
          return null;
        values.set(node_id, node_infos);
      }
    }

    if (root_id === null) {
      console.error("No root node defined!!");
      return null;
    }

    console.log("Parsed nodes");
    return [root_id, values];
  }


  hasRequiredKeys(obj, values, msg) {
    for (let i = 0; i < values.length; i++) {
      if (!obj.has(values[i])) {
        console.error(msg + values[i]);
        return false;
      }
    }

    return true;
  }

  getLSXNode(node_name) {
    let root = this.reader.xmlDoc.documentElement,
      nodes = root.children,
      nodes_node = null;

    for (let i = 0; i < nodes.length; i++)
      if (nodes[i].nodeName === node_name)
        nodes_node = nodes[i];

    if (nodes_node === null)
      console.error("No node '" + node_name + "' found!");

    return nodes_node;
  }
};
