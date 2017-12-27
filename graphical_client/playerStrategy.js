class Player extends Strategy {;

  constructor() {
    super();
  }

  play(board, table_number, seat_number) {
    //TODO should this be here or in server?
    if (this.server.validatePlay(Board, table_number, seat_number) == 'true') {
      board[table_number][seat_number] = this.token;
    }
  }
};
