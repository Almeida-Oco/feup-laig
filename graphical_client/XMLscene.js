class XMLscene extends CGFscene {
  /**
   * XMLscene class, representing the scene that is to be rendered.
   * @constructor
   */
  constructor(Interface) {
    super();

    this.hexToRgb = function (hex) {
      var bigint = parseInt(hex, 16);
      var r = (bigint >> 16) & 255;
      var g = (bigint >> 8) & 255;
      var b = bigint & 255;

      return [r / 255.0, g / 255.0, b / 255.0];
    }
    this.hexToRgbA = function (hex) {
      var c;
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return [((c >> 16) & 255) / 255.0, ((c >> 8) & 255) / 255.0, (c & 255) / 255.0];
      }
      throw new Error('Bad Hex');
    }

    this.interface = Interface;

    this.lightValues = {};
    this.server_coms = new ServerComs(8081, 'localhost');
  }

  /**
   * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
   */
  init(application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.enableTextures(true);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.selectable = false;

    this.axis = new CGFaxis(this);
  }

  /**
   * Initializes the scene lights with the values read from the LSX file.
   */
  initLights() {
    var i = 0; // Lights index.

    // Reads the lights from the scene graph.
    for (var key in this.graph.lights) {
      if (i >= 8)
        break; // Only eight lights allowed by WebGL.

      if (this.graph.lights.hasOwnProperty(key)) {
        var light = this.graph.lights[key];

        this.lights[i].setPosition(light[1][0], light[1][1], light[1][2], light[1][3]);
        this.lights[i].setAmbient(light[2][0], light[2][1], light[2][2], light[2][3]);
        this.lights[i].setDiffuse(light[3][0], light[3][1], light[3][2], light[3][3]);
        this.lights[i].setSpecular(light[4][0], light[4][1], light[4][2], light[4][3]);

        this.lights[i].setVisible(true);
        if (light[0])
          this.lights[i].enable();
        else
          this.lights[i].disable();

        this.lights[i].update();

        i++;
      }
    }
  }

  /**
   * Initializes the scene cameras.
   */
  initCameras() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
  }

  /*
   * Handler called when the graph is finally loaded.
   * As loading is asynchronous, this may be called already after the application has started the run loop
   */
  onGraphLoaded() {
    this.camera.near = this.graph.near;
    this.camera.far = this.graph.far;
    this.axis = new CGFaxis(this, this.graph.referenceLength);

    this.setGlobalAmbientLight(this.graph.ambientIllumination[0], this.graph.ambientIllumination[1],
      this.graph.ambientIllumination[2], this.graph.ambientIllumination[3]);

    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.initLights();

    this.setupShaders();

    // Adds lights group.
    this.interface.addLightsGroup(this.graph.lights);
    this.interface.addServerComs(this.server_coms);

  }

  /**
   * Displays the scene.
   */
  display() {
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.clearColor(0.1, 0.1, 0.1, 1.0);


    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    this.pushMatrix();

    if (this.graph.loadedOk) {
      // Applies initial transformations.
      this.multMatrix(this.graph.initialTransforms);

      // Draw axis
      this.axis.display();

      var i = 0;
      for (var key in this.lightValues) {
        if (this.lightValues.hasOwnProperty(key)) {
          if (this.lightValues[key]) {
            this.lights[i].setVisible(true);
            this.lights[i].enable();
          }
          else {
            this.lights[i].setVisible(false);
            this.lights[i].disable();
          }
          this.lights[i].update();
          i++;
        }
      }

      // Displays the scene.
      let root = this.graph.nodes[this.graph.root_id];
      this.graph.displayScene(this.graph.root_id, root.materialID, root.textureID, false);

    }
    else {
      // Draw axis
      this.axis.display();
    }


    this.updateScaleFactor(performance.now());

    this.popMatrix();
  }

  /**
   * Defines the selection shader and sets it to its initial color of red.
   */
  setupShaders() {
    this.sel_shader = new CGFshader(this.gl, "shaders/sel.vert", "shaders/sel.frag");

    // texture will have to be bound to unit 1 later, when using the shader, with "this.texture2.bind(1);"
    //this.testShaders[4].setUniformsValues({uSampler2: 1});
    this.sel_shader.setUniformsValues({
      uSampler2: 1
    });

    //this.texture2 = new CGFtexture(this, "textures/FEUP.jpg");

    this.updateScaleFactor(1);
    this.updateColor('#ff0000');
  }

  /**
   * Sets the uniform value normscale for the effect of growing and glowing
   * @param scale_fac a rising value such as time
   */
  updateScaleFactor(scale_fac) {
    if (this.sel_shader == undefined) {
      return;
    }

    if (scale_fac != undefined) {
      this.sel_shader.setUniformsValues({
        normScale: Math.sin(scale_fac * 0.007)
      });
    }
    else {
      this.sel_shader.setUniformsValues({
        normScale: 1
      });
    }
  }

  /**
   * Changes the color that the shader will use trough uniforms
   * @param color the color in hex string
   */
  updateColor(color) {
    let color_rgb = this.hexToRgbA(color);
    if (this.sel_shader != undefined) {
      this.sel_shader.setUniformsValues({
        red: color_rgb[0],
        green: color_rgb[1],
        blue: color_rgb[2]
      });
    }
  }
};
