class Interface extends CGFinterface {
  /**
   * Interface class, creating a GUI interface.
   * @constructor
   */
  constructor() {
    super();
    this.gui_resetted = false;
  }

  /**
   * Initializes the interface.
   * @param {CGFapplication} application
   */
  init(application) {
    CGFinterface.prototype.init.call(this, application);
    //  http://workshop.chromeexperiments.com/examples/gui

    this.gui = new dat.GUI();
    this.displayOutline = false;
    return true;
  }

  addGameType(game, scene) {
    this.server_folder = this.gui.addFolder("Game Type");
    this.server_folder.open();
    this.scene = scene;
    this.game = game;

    this.game_type = {
      'PvP': function () {
        this.game.setPlayers(new Player(), new Player());
        this.scene.curr_play = 0;
        this.scene.is_ai_play = false;
        this.scene.setPickEnabled(true);
        this.game.setTimer();
      }.bind(this),
      'Player vs AI': function () {
        let player = this.game.setPlayers(new Player(), new AI());
        if (player !== 0) {
          this.scene.curr_play = 1;
          if (player === 1) {
            this.scene.is_ai_play = false;
            this.scene.setPickEnabled(true);
          }
          else if (player === 2) {
            this.scene.is_ai_play = true;
            this.scene.setPickEnabled(false);
          }
          else
            throw new Error("Error setting Player vs AI, player does not match any value! (player = " + player + ")");
        }
        this.game.setTimer();
      }.bind(this),
      'AI vs AI': function () {
        this.game.setPlayers(new AI(), new AI());
        this.scene.curr_play = 2;
        this.scene.is_ai_play = true;
        this.scene.setPickEnabled(false);
        this.game.setTimer();
      }.bind(this)
    };

    this.gm_type = [];
    this.gm_type.push(this.server_folder.add(this.game_type, 'PvP'))
    this.gm_type.push(this.server_folder.add(this.game_type, 'Player vs AI'));
    this.gm_type.push(this.server_folder.add(this.game_type, 'AI vs AI'));
  }

  addUndo(scene) {
    this.undo = this.gui.add(scene, 'undoAction');
  }

  addScore(scene) {
    this.gui.add(scene, 'score').listen();
  }

  addAmbients(graph) {
    this.graph = graph;
    console.log("Adding ambient!");
    this.gui.add(this.graph, 'ambient', {
      'FEUP': 1,
      'Japanese': 2
    });
  }

  addCameraSpots(scene) {
    this.scene = scene;

    this.CameraPosition = 0;

    this.gui.add(this, 'CameraPosition', {
      'Free': -1,
      'Player 1': 0,
      'Player 2': 1
    });
  }

  resetGUI() {
    if (!this.gui_resetted) {
      this.gui.removeFolder("Game Type");
      this.gui.remove(this.undo);
      this.gui.add(this.scene, 'playMovie');
    }

    this.gui_resetted = true;
  }
};