let port = 8081;
let host = 'localhost';

class Oolong {
  constructor() {
    this.board = [
      ['W', '.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
    ];


    this.p1_token = 'X';
    this.waiter_token = 'W';
    this.p2_token = 'O';
    this.p1_waiter_token = '%';
    this.p2_waiter_token = '@';

    this.server = new ServerComs(port, host);
    this.next_player = null;
    this.next_table = 0;


    this.actions = [[this.board.slice(), this.next_table]];

    this.nextPlayer = function () {
      if (this.next_player === this.player1)
        this.next_player = this.player2;
      else if (this.next_player === this.player2)
        this.next_player = this.player1;
      else
        throw new TypeError("Cannot set next_player before setting both players!");
    }
  }

  setPlayer1(player_strategy) {
    if (this.next_player === null) {
      player_strategy.setServerComs(this.server);
      player_strategy.setToken(this.p1_token);
      this.player1 = player_strategy;
      this.player1.token = this.p1_token;
      this.next_player = this.player1;
    }
    else
      throw new TypeError("The first player to be set should be player1!");
  }

  setPlayer2(player_strategy) {
    if (this.next_player !== null) {
      player_strategy.setServerComs(this.server);
      player_strategy.setToken(this.p2_token);
      this.player2 = player_strategy;
      this.player2.token = this.p2_token;
    }
    else
      throw new TypeError("The first player to be set should be player1!");
  }

  getBoard() {
    return this.board;
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
    }

    return this.board;
  }

  pushAction() {
    let push = [this.board.slice(), this.next_table];
    this.actions.push(push);
  }

  play(table_number, seat_number) {
    if (this.next_player !== null && this.next_table == table_number) {
      let board = this.next_player.play(this.board, table_number, seat_number);
      if (board !== null) {
        this.pushAction();
        this.board = board;
        this.next_table = seat_number;
        this.nextPlayer();
        console.log("Play successful!");
        return this.board;
      }
    }
    console.log("Play not successful! Next_table = " + this.next_table + ", supplied = " + table_number);
    return null;
  }
};
