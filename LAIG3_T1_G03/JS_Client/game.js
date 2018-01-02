let port = 8081;
let host = 'localhost';

let table_to_token = {
  '.': function (token) {
    return token;
  },
  'W': function (token) {
    if (token === 'X')
      return '%';
    else
      return '@';
  }
}

class Oolong {
  constructor() {
    this.game_over = false;
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

    this.actions = [];
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

  checkWin() {
    if (parseInt(this.score[0]) >= 5) {
      document.getElementById("YOU_WIN").innerHTML = "Player 1";
      document.getElementById("WIN").style.visibility = "visible";
      document.getElementById("table_full").style.visibility = "hidden";
      this.game_over = true;
    }
    else if (parseInt(this.score[4] >= 5)) {
      document.getElementById("YOU_WIN").innerHTML = "Player 2";
      document.getElementById("WIN").style.visibility = "visible";
      document.getElementById("table_full").style.visibility = "hidden";
      this.game_over = true;
    }
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

  clearTimer() {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.time_left_number = 30;
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
    if (this.actions.length > 0) {
      let prev = this.actions.pop();
      this.board = prev[0];
      this.next_table = prev[1][0];
      this.nextPlayer();
      this.setTimer();
      return prev;
    }

    return this.board;
  }

  pushAction(table_n, seat_n) {
    let push = [this.board.slice(), [table_n, seat_n, this.next_player.token]];
    this.actions.push(push);
  }

  getNthAction(index) {
    if (index < this.actions.length) {
      let act = this.actions[index],
        board = act[0],
        table = act[1][0],
        seat = act[1][1],
        token = act[1][2];
      board[table][seat] = table_to_token[board[table][seat]](token);

      return [board, [table, seat]];
    }
    else
      return this.actions[this.actions.length - 1];
  }

  play(table_number, seat_number) {
    let normalPlay = function (board, table, seat) {
      let is_free = this.server.isFree(board, seat);
      this.pushAction(table, seat);
      this.board = board;
      if (is_free) {
        this.next_table = seat;
        document.getElementById("table_full").style.visibility = "hidden";
      }
      else {
        this.next_table = -1;
        document.getElementById("table_full").style.visibility = "visible";
      }

      this.nextPlayer();
      this.setTimer();
      return [[table, seat], board];
    }.bind(this);
    let validPlay = function (table) {
      return (this.next_table === table_number || this.next_table === -1 || table_number === undefined);
    }.bind(this);

    if (!this.game_over) {
      if (this.next_player !== null && validPlay(table_number)) {
        let ret = this.next_player.play(this.board, (table_number === undefined) ? this.next_table : table_number, seat_number);
        console.log(ret);
        if (ret !== null)
          return normalPlay(ret[1], ret[0][0], ret[0][1]);

      }

      console.log("Play not successful! Next_table = " + this.next_table + ", supplied = " + table_number);
      return null;
    }
  }
};
