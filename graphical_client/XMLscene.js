function XMLscene(interface) {
  CGFscene.call(this);

  this.interface = interface;
  this.server_coms = new ServerComs(8081, 'localhost');
  this.game = new Oolong();
  this.clear_color = [0.1, 0.1, 0.1, 0];
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
  CGFscene.prototype.init.call(this, application);
  this.initCameras();

  this.lights[0].setPosition(1, 4, 1, 1);
  this.lights[0].setAmbient(0.25, 0.25, 0.25, 1);
  this.lights[0].setDiffuse(0.9, 0.9, 0.9, 1);
  this.lights[0].setSpecular(0.9, 0.9, 0.9, 1);
  this.lights[0].enable();
  this.lights[0].update();

  this.gl.clearDepth(10000.0);
  this.gl.enable(this.gl.DEPTH_TEST);
  this.gl.enable(this.gl.CULL_FACE);
  this.gl.depthFunc(this.gl.LEQUAL);

  this.axis = new CGFaxis(this);
  this.enableTextures(true);
  this.transparent_shader = new CGFshader(this.gl, "shaders/sel.vert", "shaders/transparent.frag");
}

XMLscene.prototype.initCameras = function () {
  this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
}

XMLscene.prototype.readSceneInitials = function () {
  this.camera.near = this.graph.initials.get("frustum")["near"];
  this.camera.far = this.graph.initials.get("frustum")["far"];
  this.axis = new CGFaxis(this, this.graph.initials.get("reference"));
}

XMLscene.prototype.readSceneIllumination = function () {
  this.setGlobalAmbientLight(this.graph.illumination.get("ambient")["r"],
    this.graph.illumination.get("ambient")["g"],
    this.graph.illumination.get("ambient")["b"],
    this.graph.illumination.get("ambient")["a"]);

  this.gl.clearColor(this.graph.illumination.get("background")["r"],
    this.graph.illumination.get("background")["g"],
    this.graph.illumination.get("background")["b"],
    this.graph.illumination.get("background")["a"]);
}

XMLscene.prototype.readSceneLights = function () {
  this.lights = [], i = 0;
  this.graph.lights.forEach(function (value, key, map) {
    let light = new CGFlight(this, i);
    light.setPosition(value.get("position")["x"], value.get("position")["y"], value.get("position")["z"], value.get("position")["w"]);
    light.setAmbient(value.get("ambient")["r"], value.get("ambient")["g"], value.get("ambient")["b"], value.get("ambient")["a"]);
    light.setDiffuse(value.get("diffuse")["r"], value.get("diffuse")["g"], value.get("diffuse")["b"], value.get("diffuse")["a"]);
    light.setSpecular(value.get("specular")["r"], value.get("specular")["g"], value.get("specular")["b"], value.get("specular")["a"]);
    light.setVisible(true);
    light.enable(value.get("enable"));
    this.lights[i++] = light;
  }.bind(this));

  for (i = 0; i < this.lights.length; i++)
    this.lights[i].update();
}

XMLscene.prototype.onGraphLoaded = function () {
  this.readSceneInitials();
  this.readSceneIllumination();
  this.readSceneLights();
  console.log("Graph loaded successfully\n");


  this.interface.addServerComs(this.server_coms);
}

XMLscene.prototype.logPicking = function () {
  if (this.pickMode == false) {
    if (this.pickResults != null && this.pickResults.length > 0) {
      for (var i = 0; i < this.pickResults.length; i++) {
        var obj = this.pickResults[i][0];
        if (obj) {
          let pick_result = this.pickResults[i][1],
            table = Math.floor(pick_result / 10),
            seat = pick_result % 9;

          this.game.play(table, seat);
        }
      }
      this.pickResults.splice(0, this.pickResults.length);
    }
  }
}

XMLscene.prototype.display = function () {
  //this.logPicking();
  // Clear image and depth buffer everytime we update the scene
  this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  this.gl.enable(this.gl.DEPTH_TEST);

  // Initialize Model-View matrix as identity (no transformation
  this.updateProjectionMatrix();
  this.loadIdentity();

  // Apply transformations corresponding to the camera position relative to the origin
  this.applyViewMatrix();
  this.lights.forEach(function (value) {
    value.update();
  });

  if (this.graph.loadedOk) {
    this.pushMatrix();
    this.multMatrix(this.graph.initials.get("matrix"));
    this.axis.display();

    this.graph.displayScene();

    // this.setActiveShader(this.transparent_shader);
    // this.graph.displayPickables(this.graph.root_id, false);
    // this.registerForPick(this.graph.id, null);
    // this.setActiveShader(this.defaultShader);
    this.popMatrix();
  }
  else {
    this.axis.display();
  }
}

// class XMLscene extends CGFscene {
//   /**
//    * XMLscene class, representing the scene that is to be rendered.
//    * @constructor
//    */
//   constructor(Interface) {
//     super();
//     CGFscene.call(this);
//
//     this.interface = Interface;
//     this.server_coms = new ServerComs(8081, 'localhost');
//     this.game = new Oolong();
//     this.clear_color = [0.1, 0.1, 0.1, 0];
//
//     this.appear = new CGFappearance(this);
//     this.appear.loadTexture("./scenes/images/dark_wood.jpg");
//   }
//
//   /**
//    * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
//    */
//   init(application) {
//     CGFscene.prototype.init.call(this, application);
//     this.plane = new Circle(this, [25, 1]);
//     this.initCameras();
//
//     this.gl.clearDepth(10000.0);
//     this.gl.enable(this.gl.DEPTH_TEST);
//     this.gl.enable(this.gl.CULL_FACE);
//     this.gl.depthFunc(this.gl.LEQUAL);
//
//     this.axis = new CGFaxis(this);
//     this.transparent_shader = new CGFshader(this.gl, "shaders/sel.vert", "shaders/transparent.frag");
//   }
//
//   /**
//    * Initializes the scene cameras.
//    */
//   initCameras() {
//     this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
//   }
//
//   readSceneInitials() {
//     this.camera.near = this.graph.initials.get("frustum")["near"];
//     this.camera.far = this.graph.initials.get("frustum")["far"];
//     this.axis = new CGFaxis(this, this.graph.initials.get("reference"));
//   }
//
//   readSceneIllumination() {
//     this.setGlobalAmbientLight(this.graph.illumination.get("ambient")["r"],
//       this.graph.illumination.get("ambient")["g"],
//       this.graph.illumination.get("ambient")["b"],
//       this.graph.illumination.get("ambient")["a"]);
//     this.clear_color = [this.graph.illumination.get("background")["r"],
// 			this.graph.illumination.get("background")["g"],
// 			this.graph.illumination.get("background")["b"],
// 			this.graph.illumination.get("background")["a"], ];
//   }
//
//   readSceneLights() {
//     this.lights = [];
//     this.graph.lights.forEach(function (value, key, map) {
//       let light = new CGFlight(this, key);
//       light.setPosition(value.get("position")["x"], value.get("position")["y"], value.get("position")["z"], value.get("position")["w"]);
//       light.setAmbient(value.get("ambient")["r"], value.get("ambient")["g"], value.get("ambient")["b"], value.get("ambient")["a"]);
//       light.setDiffuse(value.get("diffuse")["r"], value.get("diffuse")["g"], value.get("diffuse")["b"], value.get("diffuse")["a"]);
//       light.setSpecular(value.get("specular")["r"], value.get("specular")["g"], value.get("specular")["b"], value.get("specular")["a"]);
//       light.setVisible(true);
//       light.enable(value.get("enable"));
//       this.lights.push(light);
//     }.bind(this));
//
//     for (let i = 0; i < this.lights.length; i++)
//       this.lights[i].update();
//   }
//
//   /*
//    * Handler called when the graph is finally loaded.
//    * As loading is asynchronous, this may be called already after the application has started the run loop
//    */
//   onGraphLoaded() {
//     this.readSceneInitials();
//     this.readSceneIllumination();
//     this.readSceneLights();
//     console.log("Graph loaded successfully\n");
//
//
//     this.interface.addServerComs(this.server_coms);
//   }
//
//   logPicking() {
//     if (this.pickMode == false) {
//       if (this.pickResults != null && this.pickResults.length > 0) {
//         for (var i = 0; i < this.pickResults.length; i++) {
//           var obj = this.pickResults[i][0];
//           if (obj) {
//             let pick_result = this.pickResults[i][1],
//               table = Math.floor(pick_result / 10),
//               seat = pick_result % 9;
//
//             this.game.play(table, seat);
//           }
//         }
//         this.pickResults.splice(0, this.pickResults.length);
//       }
//     }
//   }
//
//   /**
//    * Displays the scene.
//    */
//   display() {
//     //this.logPicking();
//     // Clear image and depth buffer everytime we update the scene
//     this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
//     this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
//     this.gl.enable(this.gl.DEPTH_TEST);
//     this.gl.clearColor(this.clear_color[0], this.clear_color[1], this.clear_color[2], this.clear_color[3]);
//
//     // Initialize Model-View matrix as identity (no transformation
//     this.updateProjectionMatrix();
//     this.loadIdentity();
//
//     // Apply transformations corresponding to the camera position relative to the origin
//     this.applyViewMatrix();
//     this.appear.apply();
//     this.plane.render(1, 1);
//
//
//     /*
//     if (this.graph.loadedOk) {
//       this.pushMatrix();
//       this.multMatrix(this.graph.initials.get("matrix"));
//       this.axis.display();
//
//       this.graph.displayScene();
//
//       // this.setActiveShader(this.transparent_shader);
//       // this.graph.displayPickables(this.graph.root_id, false);
//       // this.registerForPick(this.graph.id, null);
//       // this.setActiveShader(this.defaultShader);
//       this.popMatrix();
//     }
//     else {
//       this.axis.display();
//     }
// 		*/
//   }
//
//   setMaterial(table, seat) {
//
//   }
// };
