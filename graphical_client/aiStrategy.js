class AI extends Strategy {
  constructor() {
    super();
  }

  play(board, table_n) {
    let ret = this.server.aiMove(board, table_n, this.token);
    if (ret !== null && ret !== undefined) {
      ret[0][0] = parseInt(ret[0][0]);
      ret[0][1] = parseInt(ret[0][1]);
      return ret;
    }
    else {
      console.error("AI play failed! table_n = " + table_n);
      console.error(board);
      return null;
    }
  }
}
