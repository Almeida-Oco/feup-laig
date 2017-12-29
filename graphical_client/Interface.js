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

  addServerComs(server_coms) {
    var server_folder = this.gui.addFolder("Server");
    server_folder.open();

    server = server_coms;

    this.server = server_coms;
    var server = server_coms;
    /*
      var obj = {
        ping: function () {
          console.log("Pinging PL Server");
          server.plRequest('handshake');
        }


        startgame: function(){
          console.log('Starting Game.');
          server.plRequest('startgame');
        }

      };
    */
    this.start_opts = {

      humanVShuman: function () {
        console.log('Starting Human Vs Human.');
        server.plStartRequest('startgame_4');
      },

      easy: function () {
        console.log('Starting Human Vs AI EASY.');
        server.plStartRequest('startgame_1');
      },

      medium: function () {
        console.log('Starting Human Vs AI MEDIUM.');
        server.plStartRequest('startgame_2');
      },

      hard: function () {
        console.log('Starting Human Vs AI HARD.');
        server.plStartRequest('startgame_3');
      }

    };

    this.ai_opts = server_folder.addFolder("vsAI");
    this.ai_opts.open();

    this.ai_opts.add(this.start_opts, 'humanVShuman');
    this.ai_opts.add(this.start_opts, 'easy');
    this.ai_opts.add(this.start_opts, 'medium');
    this.ai_opts.add(this.start_opts, 'hard');

    this.game_opts = {

      getstate: function () {
        console.log('Getting GameState');
        server.plGameStateRequest('gamestate');
      },

      getturn: function () {
        console.log('Getting Whose Turn');
        server.plRequest('geturn');
      }

    };

    this.game_opts_folder = server_folder.addFolder("Opts");
    this.game_opts_folder.open();


    this.game_opts_folder.add(this.game_opts, 'getstate');
    this.game_opts_folder.add(this.game_opts, 'getturn');

    this.game_movs = {

      testmove: function () {
        console.log('Doing A Move');

        /* Example Test Move Dont Forget to init Game*/

        if (this.scene.gameState.board_string == undefined) {
          alert('Board is Undefined maybe start game first ');
        }
        else {

          server.plSendMove('x', 0, 3, this.scene.gameState.board_string);
        }
      }

    };

    this.game_movs.scene = this.scene;

    this.game_movs_folder = server_folder.addFolder("Moves");
    this.game_movs_folder.open();

    this.game_movs_folder.add(this.game_movs, 'testmove');
  }

  addUndo(scene) {
    this.gui.add(scene, 'undoAction');
  }
};
