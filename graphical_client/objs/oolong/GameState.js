/**
* GameState/Board since board is static
* @param String startString string that comes from PL server and inits the gameboard
* @constructor
*/
function GameState(scene, startString) {
  CGFobject.call(this, scene);

  this.scene = scene;



  console.log('Hello From GameState String :' + startString);

  this.board_string = startString;

  /**
  * TODO Make Initial Board From String
  */


  this.board = Circle(scene, [50,21]);
  this.initTables();

 // this.initBuffers();
};

GameState.prototype = Object.create(CGFobject.prototype);
GameState.prototype.constructor = GameState;

/*
GameState.prototype.initBuffers = function() {


  this.primitiveType = this.scene.gl.TRIANGLES;
  this.initGLBuffers();
};
*/

GameState.prototype.display = function() {
  this.board.display();

  for(table in this.tables){
    table.display();
  }

  for(special in this.specials){
    special.display();
  }

}

GameState.prototype.initTables = function() {
  this.tables = {}; //hastable for storing all the tables and each a hastable for seats

  for(let i = 0;i < 9; i++){
    var table = {};
    for(let k = 0; k < 9 ; k++){
      let transformation = [0,0,0] /* TODO Transformations applied here to tables */
      table[k] = new Seat(scene, transformation);
    }
    this.tables[i] = table;
  }

}

GameState.prototype.setNewBoard = function(newboard, oldboard) {
  console.log('GameState : Setting New Board');

  /**
  * TODO - Actual Parsing of the new board string and setting
  */

  console.log('NewBoard is: '+ newboard);

  this.compareAndPlayAnimations(newboard, oldboard);

}

GameState.prototype.compareAndPlayAnimations = function(newboard, oldboard){
  console.log('Comparing Game Board and playing animations');

  /**
  * TODO - Finish this
  */
}

GameState.prototype.goBack = function(oldboard) {

  console.log('GoingBack');

  /**
  * TODO - Finish this
  */

}

/*
GameState.prototype.initSpecials = function() {

}
*/