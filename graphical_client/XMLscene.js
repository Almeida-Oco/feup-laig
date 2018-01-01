let time_between_plays = 1;
let player = 0;
let ai1 = 1;
let ai2 = 2;
let time_between_movies = 2;
let orbit_ang = 180 * DEGREE_TO_RAD;
let orbit_time = 4;
let lin_speed = 5;

let ambients = ["ambient1.xml", "ambient2.xml"];

let cam_pts = {
  1: [[0, -13, 16], [0, 13, 16]],
  2: [[0, -23, 15], [0, 23, 15]]
};

class XMLscene extends CGFscene {
  constructor(Interface) {
    super();

    this.update_game = function (ret) {
      if (ret !== null && ret !== undefined) {
        this.graph.updateTokens(ret[1]); //update board
        this.graph.fill_cup = ret[0][0] * 10 + ret[0][1] + 1;
        this.setPickEnabled(false);
        this.score = this.game.updateScore();
      }
      else {
        console.log("Return was null!");
      }
    }.bind(this);
    this.player_play = function (table, seat) {
      let ret = this.game.play(table, seat);
      if (ret !== null && ret[0][0] !== -1 && ret[0][1] !== -1) {
        this.update_game(ret);
        return true;
      }
      return (ret !== null && ret[0][0] === -1 && ret[0][1] === -1); //whether it is end play or not
    }.bind(this);
    this.ai_play = function () {
      if (this.is_ai_play) {
        let ret = this.game.play();
        this.update_game(ret);
      }
    }.bind(this);
    this.play = {
      0: function (table, seat) { //Player vs Player
        if (this.player_play(table, seat)) {
          this.is_ai_play = false;
          this.setPickEnabled(true);
        }
      }.bind(this),

      1: function (table, seat) { //Player vs AI
        if (this.is_ai_play) {
          this.ai_play();
          this.is_ai_play = false;
        }
        else {
          if (this.player_play(table, seat) && ret[0][0] !== -1 && ret[0][1] !== -1) {
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

    //key => curr_pos, param => destination
    this.move_camera = {
      '-1': function (time_elapsed, dest) {
        if (dest === 0 || dest === 1) {
          this.interface.setActiveCamera(null);
          this.camera.setTarget([0, 0, 0]);

          let start_pt = [this.camera.position[0], this.camera.position[1], this.camera.position[2]],
            end_pt = cam_pts[this.graph.ambient][dest];
          return this.moveCamera(time_elapsed, start_pt, end_pt);
        }
        else
          return true;
      }.bind(this),
      0: function (time_elapsed, dest) {
        if (dest === -1) {
          this.interface.setActiveCamera(this.camera);
          return true;
        }
        else if (dest === 1 || dest === 0) {
          return this.doOrbit(time_elapsed, (dest === 1) ? orbit_ang : 0);
        }
      }.bind(this),
      1: function (time_elapsed, dest) {
        if (dest === -1) {
          this.interface.setActiveCamera(this.camera);
          return true;
        }
        else if (dest === 0 || dest === 1)
          return this.doOrbit(time_elapsed, (dest === 1) ? orbit_ang : (orbit_ang * 2));
      }.bind(this)
    };


    this.curr_ambient = 0;
    this.curr_play = 0;
    this.prev_play = -1;
    this.timeout = null;
    this.is_ai_play = false;

    this.display_movie = -1;
    this.movie_time = time_between_movies;

    this.cam_pos = 0;
    this.cam_orbit_ang = 0;
    this.curr_time = 0;
    this.anim_time = 0;
    this.start_pt = [0, 0, 0];


    this.stop_time = 0;
    this.prev_time = Date.now();
    this.interface = Interface;
    this.server_coms = new ServerComs(8081, 'localhost', this);
    this.game = new Oolong();
    this.board = null;
    this.score = this.game.updateScore();
    this.game.setPlayers(new Player(), new Player());
  }

  init(application) {
    CGFscene.prototype.init.call(this, application);
    this.camera = new CGFcamera(0.5, 0.1, 500, [0, -13, 16], vec3.fromValues(0, 0, 0));

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

  switchCamera() {

    this.camera.setPosition = [0, -10, 0];

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
      this.game.setTimer();
    }
    if (this.graph.xml_n === 1) { //Tables loaded
      this.readSceneInitials();
      this.readSceneIllumination();
      this.readSceneLights();

      this.interface.addGameType(this.game, this);
      this.interface.addUndo(this);
      this.interface.addSwitchCamera(this);
      this.interface.addScore(this);
      this.interface.addCameraSpots(this);
    }

    this.graph.updateTokens(this.game.getBoard());

    if (this.graph.xml_n === 1) {
      this.graph.loadGraph("ambient1.xml");
    }
    else if (this.graph.xml_n === 2) {
      this.graph.loadGraph("jap.xml");
    }
  }

  logPicking() {
    if (this.pickMode == false) {
      if (this.pickResults != null && this.pickResults.length > 0) {
        for (var i = 0; i < this.pickResults.length; i++) {
          var obj = this.pickResults[i][0];
          if (obj) {
            let pick_result = this.pickResults[i][1];
            console.log(pick_result);
            if (pick_result < 100) { //picked a token
              let table = Math.floor(pick_result / 10),
                seat = pick_result % 10 - 1;
              if (this.curr_play === player || this.curr_play === ai1 && !this.is_ai_play)
                this.play[this.curr_play](table, seat);

            }
            else if (pick_result >= 100 && pick_result <= 102) {
              this.graph.changeDifficulty();
            }
          }
        }
        this.pickResults.splice(0, this.pickResults.length);
      }
    }
  }

  undoAction() {
    let ret;
    if (this.graph.fill_cup === 0) {
      if ((ret = this.game.popAction()) !== null) {
        this.board = ret[0];
        this.graph.fill_cup = -(ret[1][0] * 10 + ret[1][1] + 1);
        this.setPickEnabled(false);
        this.score = this.game.updateScore();
      }
    }

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

  playMovie() {
    if (this.display_movie === -1) {
      this.display_movie = 0;

      this.graph.tokens.forEach(function (value) {
        value[1].getPrimitive().resetHeight();
      }.bind(this));
    }
  }

  //TODO all the animations should go here!
  update(curr_time) {
    let time_elapsed = (curr_time - this.prev_time) * 1.0 / 1000.0;

    this.checkCameraPos(time_elapsed);

    if (this.display_movie === -1) {
      if (this.tickTock(time_elapsed)) {
        this.play[this.curr_play]();
      }

      if (this.graph.fill_cup > 0 &&
        this.graph.tokens[this.graph.fill_cup][1].getPrimitive().nextLiquid(time_elapsed)) {
        this.graph.fill_cup = 0;
        this.setPickEnabled(true);
      }
      else if (this.graph.fill_cup < 0 &&
        this.graph.tokens[-this.graph.fill_cup][1].getPrimitive().prevLiquid(time_elapsed)) {
        this.graph.fill_cup = 0;
        this.graph.updateTokens(this.board);
        this.setPickEnabled(true);
        this.board = null;
      }
    }
    else {
      this.setPickEnabled(false);
      if (this.graph.fill_cup > 0 &&
        this.graph.tokens[this.graph.fill_cup][1].getPrimitive().nextLiquid(time_elapsed)) {
        this.graph.fill_cup = 0;
      }
      if (this.graph.fill_cup === 0 &&
        this.display_movie <= this.game.actions.length) {
        let ret = this.game.getNthAction(this.display_movie);
        this.graph.updateTokens(ret[0]);
        if (ret[1] !== null)
          this.graph.fill_cup = ret[1][0] * 10 + ret[1][1] + 1;
        this.display_movie++;
      }
    }

    this.prev_time = curr_time;
  }

  checkCameraPos(time_elapsed) {
    if (this.curr_ambient === this.graph.ambient || this.cam_pos === -1) {
      let cam_pos = parseInt(this.interface.CameraPosition);
      if (this.move_camera[this.cam_pos](time_elapsed, cam_pos)) {
        this.cam_pos = cam_pos;
        if (this.cam_pos === 1)
          this.cam_orbit_ang = orbit_ang;
        else if (this.cam_pos === 0)
          this.cam_orbit_ang = 0;
      }
    }
    else {
      this.interface.setActiveCamera(null);
      this.camera.setTarget([0, 0, 0]);

      let start_pt = [this.camera.position[0], this.camera.position[1], this.camera.position[2]],
        end_pt = cam_pts[this.graph.ambient][this.interface.CameraPosition];
      if (this.moveCamera(time_elapsed, start_pt, end_pt))
        this.curr_ambient = this.graph.ambient;
    }
  }



  doOrbit(time_elapsed, dest_ang) {
    if (this.cam_orbit_ang !== dest_ang) {
      let ang_inc = this.linearInterpolation(0, orbit_ang, time_elapsed, orbit_time);

      if (dest_ang === 0) { //destination is player1 from mid player 1->2
        if ((this.cam_orbit_ang - ang_inc) < 0)
          ang_inc = -this.cam_orbit_ang;
        else
          ang_inc = -ang_inc;
      }
      else if (dest_ang === orbit_ang) { //destination is player2 from player1 / mid player 2->1
        if (this.cam_orbit_ang > orbit_ang) {
          if ((this.cam_orbit_ang - ang_inc) < orbit_ang)
            ang_inc = orbit_ang - this.cam_orbit_ang;
          else
            ang_inc = -ang_inc
        }
        else {
          if ((this.cam_orbit_ang + ang_inc) > orbit_ang)
            ang_inc = orbit_ang - this.cam_orbit_ang;
        }
      }
      else if (dest_ang === orbit_ang * 2) { //destination is player1 from player2
        if ((this.cam_orbit_ang + ang_inc) > (orbit_ang * 2))
          ang_inc = (orbit_ang * 2) - this.cam_orbit_ang;
      }

      this.camera.orbit(CGFcameraAxis.Z, ang_inc);
      this.cam_orbit_ang += ang_inc;
    }

    let ret = (this.cam_orbit_ang === dest_ang);
    if (this.cam_orbit_ang === (orbit_ang * 2))
      this.cam_orbit_ang = 0;

    return ret;
  }

  moveCamera(time_elapsed, start_pt, end_pt) {
    let vec = [end_pt[0] - start_pt[0], end_pt[1] - start_pt[1], end_pt[2] - start_pt[2]],
      angles = this.xyzAngles(vec),
      time_left = this.calcRemTime(angles, start_pt, end_pt, lin_speed);

    if (time_elapsed < time_left) {
      let x = this.camera.position[0] + angles[0] * lin_speed * time_elapsed,
        y = this.camera.position[1] + angles[1] * lin_speed * time_elapsed,
        z = this.camera.position[2] + angles[2] * lin_speed * time_elapsed;

      console.log([x, y, z]);
      this.camera.setPosition([x, y, z]);
      return false;
    }
    else {
      this.camera.setPosition(end_pt);
      return true;
    }
  }

  xyzAngles(vector) {
    let magnitude = function (vec) {
      return Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
    };
    let mag = magnitude(vector),
      cosa = vector[0] / mag,
      cosb = vector[1] / mag,
      cosj = vector[2] / mag;
    // theta = Math.acos(vector[0] / (Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2)))),
    //   z_angle = Math.acos(vector[2] / mag);

    return [cosa, cosb, cosj];
  }

  camPosEqualTo(point) {
    return (this.camera.position[0] === point[0] &&
      this.camera.position[1] === point[1] &&
      this.camera.position[2] === point[2]);
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


    if (this.graph.xml_n >= 3) {
      this.pushMatrix();
      this.multMatrix(this.graph.initials.get("matrix"));

      this.graph.displayScene();

      this.popMatrix();
    }
  }


  calcRemTime(vec_angles, start_pt, end_pt, speed) {
    let start_x = start_pt[0],
      end_x = end_pt[0];

    return (end_x - start_x) / (vec_angles[0] * speed);
  }

  linearInterpolation(min, max, t, t_limit) {
    let passed = t / t_limit;
    return (1 - passed) * min + (passed * max);
  }

  ptsDistance(pt1, pt2) {
    return Math.sqrt(Math.pow(pt1[0] - pt2[0], 2) + Math.pow(pt1[1] - pt2[1], 2) + Math.pow(pt1[2] - pt2[2], 2));
  };
};
