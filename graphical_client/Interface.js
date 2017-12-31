class Interface extends CGFinterface {
  /**
   * Interface class, creating a GUI interface.
   * @constructor
   */
  constructor() {
    super();
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
    let server_folder = this.gui.addFolder("Game Type");
    server_folder.open();
    this.scene = scene;
    this.game = game;

    this.game_type = {
      'Player vs Player': function () {
        this.game.setPlayers(new Player(), new Player());
        this.scene.curr_play = 0;
        this.scene.is_ai_play = false;
        this.scene.setPickEnabled(true);
      }.bind(this),
      'Player vs AI': function () {
        let player = this.game.setPlayers(new Player(), new AI());
        console.log("Player = " + player);
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
      }.bind(this),
      'AI vs AI': function () {
        this.game.setPlayers(new AI(), new AI());
        this.scene.curr_play = 2;
        this.scene.is_ai_play = true;
        this.scene.setPickEnabled(false);
      }.bind(this)
    };

    server_folder.add(this.game_type, 'Player vs Player');
    server_folder.add(this.game_type, 'Player vs AI');
    server_folder.add(this.game_type, 'AI vs AI');
  }

  addUndo(scene) {
    this.gui.add(scene, 'undoAction');
  }

  addSwitchCamera(scene) {
    this.gui.add(scene, 'switchCamera');
  }

  addScore(scene) {
    this.gui.add(scene, 'score').listen();
  }
};
