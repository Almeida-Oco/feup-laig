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

  addGameType(game, server_coms) {
    let server_folder = this.gui.addFolder("Game Type");
    server_folder.open();
    this.server = server_coms;
    this.game = game;

    this.game_type = {
      'testAI': function () {
        let ret = this.server.aiMove(this.game.board, this.game.next_table, this.game.next_player.token);
        console.log("AI PLAY : ");
        console.log(ret);
      }.bind(this),
    };

    server_folder.add(this.game_type, 'testAI');
  }

  addUndo(scene) {
    this.gui.add(scene, 'undoAction');
  }
};
