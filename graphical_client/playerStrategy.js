class Player extends Strategy {;
  constructor() {
    super();
  }

  play(board, table_n, seat_n) {
    let reply = this.server.tryMove(board, table_n, seat_n, this.token);
    return reply;
  }
};
