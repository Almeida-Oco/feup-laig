class Player extends Strategy {;
  constructor() {
    super();
  }

  play(board, table_n, seat_n) {
    let reply = this.server.tryMove(board, table_n, seat_n, this.token);
    if (reply !== undefined && reply.length > 0) {
      board = reply;
      console.log("Reply = " + reply);
      console.log("Board = " + board);
      return true;
    }

    return false;
  }
};
