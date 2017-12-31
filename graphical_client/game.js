let port = 8081;
let host = 'localhost';

class Oolong {
  constructor() {
    this.p1_token = 'X';
    this.waiter_token = 'W';
    this.p2_token = 'O';
    this.p1_waiter_token = '%';
    this.p2_waiter_token = '@';

    this.server = new ServerComs(port, host);
    this.board = this.server.newBoard();
    this.board[0][0] = "W";

    this.next_player = null;
    this.next_table = 0;

    this.score = "0 - 0";

    this.actions = [[this.board.slice(), this.next_table]];
    this.time_left = document.getElementById("time_left");
    this.time_left.innerHTML = "30 s";
    this.time_left_number = 30;

    this.interval = null;

    this.nextPlayer = function () {
      if (this.next_player === this.player1)
        this.next_player = this.player2;
      else if (this.next_player === this.player2)
        this.next_player = this.player1;
      else
        throw new TypeError("Cannot set next_player before setting both players!");
    }
  }

  updateScore() {
    if (this.player1 !== null && this.player1 !== undefined && this.player2 !== null && this.player2 !== undefined) {
      let p1_score = this.server.getScore(this.board, this.player1.token);
      let p2_score = this.server.getScore(this.board, this.player2.token);
      if (p1_score !== null && p2_score !== null)
        this.score = p1_score + " - " + p2_score;

      return this.score;
    }
    else
      console.error("updateScore(): Either player1 or player2 is null/undefined!\n");

    return this.score;
  }

  /**
   * Sets the players of the game
   * @param player1 {Strategy} The first player
   * @param player2 {Strategy} The second player
   * @return {integer} 1 If the next player is player 1, 2 if the next player is player2, null on error.
   */
  setPlayers(player1, player2) {
    if (player1 !== null && player1 !== undefined && player2 !== null && player2 !== undefined) {
      player1.setServerComs(this.server);
      player2.setServerComs(this.server);
      player1.setToken(this.p1_token);
      player2.setToken(this.p2_token);
      let ret = 0;
      if (this.next_player === this.player1 || this.next_player === null) {
        this.next_player = player1;
        ret = 1;
      }
      else {
        this.next_player = player2;
        ret = 2;
      }

      this.player1 = player1;
      this.player2 = player2;
      return ret;
    }

    return null;
  }

  getBoard() {
    return this.board;
  }


  setTimer() {
    let func = function () {
      this.time_left_number--;
      this.time_left.innerHTML = this.time_left_number + " s";
      if (this.time_left_number === 0) {
        this.nextPlayer();
        clearInterval(this.interval);
        this.interval = null;
        this.time_left_number = 31;
        this.interval = setInterval(function () {
          func();
        }.bind(this), 1000);
      }
    }.bind(this);
    if (this.interval === null) {
      this.interval = setInterval(function () {
        func();
      }.bind(this), 1000);
    }
    else {
      clearInterval(this.interval);
      this.time_left_number = 31;
      this.interval = setInterval(function () {
        func();
      }.bind(this), 1000);
    }
  }

  nextPlayer() {
    if (this.next_player === this.player1)
      this.next_player = this.player2;
    else if (this.next_player === this.player2)
      this.next_player = this.player1;
    else
      throw new Error("Game::next_player does not match any player!");
  }

  popAction() {
    console.log(this.actions);
    if (this.actions.length > 0) {
      let prev = this.actions.pop();
      this.board = prev[0];
      this.next_table = prev[1];
      this.nextPlayer();
      this.setTimer();
    }

    return this.board;
  }

  pushAction() {
    let push = [this.board.slice(), this.next_table];
    this.actions.push(push);
  }

  play(table_number, seat_number) {
    if (this.next_player !== null && (this.next_table === table_number || table_number === undefined)) {
      let ret = this.next_player.play(this.board, this.next_table, seat_number);
      if (ret !== null) {
        this.pushAction();
        this.board = ret[1];
        this.next_table = ret[0][1];
        this.nextPlayer();
        this.setTimer();
        return ret;
      }
    }
    console.log("Play not successful! Next_table = " + this.next_table + ", supplied = " + table_number);
    return null;
  }
};
