let port = 8081;
let host = 'localhost';

class Oolong {
  constructor() {
    this.board = {
      0: ['.', '.', '.', '.', 'W', '.', '.', '.', '.'],
      1: ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      2: ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      3: ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      4: ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      5: ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      6: ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      7: ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
      8: ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
    };

    this.p1_token = 'X';
    this.waiter_token = 'W';
    this.p2_token = 'O';
    this.p1_waiter_token = '%';
    this.p2_waiter_token = '@';

    this.server_coms = new ServerComs(port, host);
    this.next_player = null;
    this.next_table = 0;
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
      this.player1 = player_strategy;
      this.player1.token = this.p1_token;
      this.next_player = this.player1;
    }
    else
      throw new TypeError("The first player to be set should be player1!");
  }

  setPlayer2(player_strategy) {
    if (this.next_player !== null) {
      this.player2 = player_strategy;
      this.player2.token = this.p2_token;
    }
    else
      throw new TypeError("The first player to be set should be player1!");
  }

  getBoard() {
    return this.board;
  }

  play(table_number, seat_number) {
    if (this.next_player !== null && this.next_table == table_number) {
      this.next_player.play(table_number, seat_number);
      this.nextPlayer();
    }
  }


};