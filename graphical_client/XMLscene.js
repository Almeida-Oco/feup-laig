let time_between_plays = 1;
let player = 0;
let ai1 = 1;
let ai2 = 2;

let ambients = ["ambient1.xml", "ambient2.xml"];

class XMLscene extends CGFscene {
  constructor(Interface) {
    super();

    this.update_game = function (ret) {
      if (ret !== null && ret !== undefined) {
        this.graph.updateTokens(ret[1]); //update board
        this.graph.fill_cup = ret[0][0] * 10 + ret[0][1] + 1;
        this.setPickEnabled(false);
        this.score = this.game.updateScore();
        console.log(this.score);
      }
      else {
        console.log("Return was null!");
      }
    }.bind(this);
    this.player_play = function (table, seat) {
      let ret;
      if ((ret = this.game.play(table, seat)) !== null) {
        this.update_game(ret);
        return true;
      }
      else
        return false;
    }.bind(this);
    this.ai_play = function () {
      if (this.is_ai_play) {
        let ret = this.game.play();
        this.update_game(ret);
      }
    }.bind(this);

    this.play = {
      0: function (table, seat) { //Player vs Player
        this.player_play(table, seat);
        this.is_ai_play = false;
        this.setPickEnabled(true);
      }.bind(this),
      1: function (table, seat) { //Player vs AI
        if (this.is_ai_play) {
          this.ai_play();
          this.is_ai_play = false;
        }
        else {
          if (this.player_play(table, seat)) {
            this.is_ai_play = true;
            this.setPickEnabled(false);
          }
        }
      }.bind(this),
      2: function () { //AI vs AI
        if (this.is_ai_play) {
          this.ai_play();
          this.is_ai_play = true;
          this.setPickEnabled(false);
        }
      }.bind(this)
    };

    this.curr_play = 0;
    this.prev_play = -1;
    this.timeout = null;
    this.is_ai_play = false;

    this.stop_time = 0;
    this.prev_time = Date.now();
    this.interface = Interface;
    this.server_coms = new ServerComs(8081, 'localhost', this);
    this.game = new Oolong();
    this.score = this.game.updateScore();
    this.game.setPlayers(new Player(), new Player());
  }

  init(application) {
    CGFscene.prototype.init.call(this, application);
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(0, -10, 10), vec3.fromValues(0, 0, 0));
    this.lights = [];

    this.cup = new Cup(this, [3, 0.01]);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);

    this.axis = new CGFaxis(this);
    this.enableTextures(true);
    this.setPickEnabled(true);
    this.transparent_shader = new CGFshader(this.gl, "shaders/sel.vert", "shaders/transparent.frag");
    this.blend_shader = new CGFshader(this.gl, 'shaders/sel.vert', 'shaders/blend.frag');
    this.blend_shader.setUniformsValues({
      'uSampler': 0
    });
    this.setUpdatePeriod(16.666667); //60 FPS
  }

  //TODO all the animations should go here!
  update(curr_time) {
    let time_elapsed = (curr_time - this.prev_time) * 1.0 / 1000.0;

    if (this.tickTock(time_elapsed)) {
      console.log("Playing\n");
      this.play[this.curr_play]();
    }

    if (this.graph.fill_cup !== 0 &&
      this.graph.tokens[this.graph.fill_cup][1].getPrimitive().nextLiquid(time_elapsed)) {
      this.graph.fill_cup = 0;
      this.setPickEnabled(true);
    }

    this.prev_time = curr_time;
  }


  tickTock(time_elapsed) {
    if (this.is_ai_play && (this.curr_play === ai1 || this.curr_play === ai2) && this.graph.fill_cup === 0) {
      this.stop_time += time_elapsed;
      if (this.stop_time >= time_between_plays) {
        this.stop_time = 0;
        return true;
      }
    }
    else
      this.stop_time = 0;
    return false;
  }

  readSceneInitials() {
    this.camera.near = this.graph.initials.get("frustum")["near"];
    this.camera.far = this.graph.initials.get("frustum")["far"];
    this.axis = new CGFaxis(this, this.graph.initials.get("reference"));
  }

  readSceneIllumination() {
    this.setGlobalAmbientLight(this.graph.illumination.get("ambient")["r"],
      this.graph.illumination.get("ambient")["g"],
      this.graph.illumination.get("ambient")["b"],
      this.graph.illumination.get("ambient")["a"]);

    this.gl.clearColor(this.graph.illumination.get("background")["r"],
      this.graph.illumination.get("background")["g"],
      this.graph.illumination.get("background")["b"],
      this.graph.illumination.get("background")["a"]);
  }

  readSceneLights() {
    let i = this.lights.length;
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

  onGraphLoaded() {
    if (this.graph.xml_n === 3) {
      this.interface.addAmbients(this.graph);
    }
    if (this.graph.xml_n === 1) {
      this.readSceneInitials();
      this.readSceneIllumination();
      this.readSceneLights();

      this.interface.addGameType(this.game, this);
      this.interface.addUndo(this);
      this.interface.addScore(this);
    }

    this.graph.updateTokens(this.game.getBoard());

    if (this.graph.xml_n === 1) {
      this.graph.loadGraph("ambient1.xml");
    }
    else if (this.graph.xml_n === 2) {
      console.log("LOADING JAPANESE XML\n");
      this.graph.loadGraph("jap.xml");
    }
  }

  logPicking() {
    if (this.pickMode == false) {
      if (this.pickResults != null && this.pickResults.length > 0) {
        for (var i = 0; i < this.pickResults.length; i++) {
          var obj = this.pickResults[i][0];
          if (obj) {
            let pick_result = this.pickResults[i][1],
              table = Math.floor(pick_result / 10),
              seat = pick_result % 10 - 1;
            if (this.curr_play === player || this.curr_play === ai1 && !this.is_ai_play) {
              this.play[this.curr_play](table, seat);
            }
          }
        }
        this.pickResults.splice(0, this.pickResults.length);
      }
    }
  }

  undoAction() {
    this.graph.updateTokens(this.game.popAction());
    let prev_play;

    if (this.curr_play !== -1) { //no undo timeout in place
      this.prev_play = this.curr_play;
      this.curr_play = -1;
      this.timeout = setTimeout(function () {
        this.curr_play = this.prev_play;
        this.prev_play = -1;
      }.bind(this));
    }
    else { //there was already a timeout
      clearTimeout(this.timetout);
      this.timeout = setTimeout(function () {
        this.curr_play = this.prev_play;
        this.prev_play = -1;
      }.bind(this));
    }
  }

  display() {
    if (this.graph.fill_cup === 0)
      this.logPicking();
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

      this.graph.displayScene();

      this.translate(0, 0, 5);
      this.popMatrix();
    }
  }
};
