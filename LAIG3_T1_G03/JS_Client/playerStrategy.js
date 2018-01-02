class Player extends Strategy {;
  constructor() {
    super();
  }

  play(board, table_n, seat_n) {
    let reply = this.server.tryMove(board, table_n, seat_n, this.token);
    if (reply !== null && reply !== undefined)
      return [[table_n, seat_n], reply];
    else {
      console.error("Play failed!");
      return null;
    }
  }
};
