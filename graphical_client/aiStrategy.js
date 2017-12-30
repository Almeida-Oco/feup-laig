class AI extends Strategy {
  constructor() {
    super();
  }

  play(board, table_n) {
    let ret = this.server.aiMove(board, table_n, this.token);
    if (ret !== null && ret !== undefined) {
      return ret;
    }
    else {
      console.error("AI play failed! table_n = " + table_n);
      console.error(board);
      return null;
    }
  }
}
