let isPrimitive = function (data) {
  return (data !== Object(data));
}

class ServerComs {
  constructor(port, url, scene) {
    if (port == undefined) {
      this.port = 8081;
      console.log("Undefined port, defaulting to 8081");
    }
    else {
      this.port = port;
    }

    if (url == undefined) {
      this.url = 'localhost';
      console.log("Undefined url, defaulting to localhost");
    }
    else {
      this.url = url;
    }

    console.log("Server communication established!");
    this.scene = scene;
  }

  /**
   * Performs a request to the prolog server with the given string
   * @param request_str The string to send to the server
   * @return The reply of the server
   */
  doRequest(request_str, url, port) {
    let request = new XMLHttpRequest();
    request.open("GET", 'http://' + url + ':' + port + '/' + request_str, false);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(null);

    if (request.status === 200) {
      return request.responseText;
    }
    return null;
  }

  newBoard() {
    let ret = this.doRequest("newboard", this.url, this.port);
    if (ret !== null && ret !== undefined)
      return this.stringToArray(ret);
    else
      return null;
  }

  isFree(board, table) {
    let request_str = "isFree(";
    request_str += this.arrayToString(board) + ",";
    request_str += table + ")";

    let ret = this.doRequest(request_str, this.url, this.port);

    if (ret !== null && ret !== undefined)
      return ret === "true";
    else
      return false;
  }

  tryMove(board, table_n, seat_n, token) {
    let request_str = "turn(";
    request_str += this.arrayToString(board) + ",";
    request_str += table_n + ",";
    request_str += seat_n + ",";
    request_str += "'" + token + "')";

    let ret = this.doRequest(request_str, this.url, this.port);

    if (ret !== null && ret !== undefined)
      return this.stringToArray(ret);
    else
      return null;
  }

  aiMove(board, table_n, token) {
    let request_str = "aiTurn(";
    request_str += this.arrayToString(board) + ",";
    request_str += table_n + ",";
    request_str += "'" + token + "')";

    let ret = this.doRequest(request_str, this.url, this.port);

    if (ret !== null && ret !== undefined)
      return this.stringToArray(ret);
    else
      return null;
  }

  getScore(board, token) {
    let request_str = "playerScore(";
    request_str += this.arrayToString(board) + ",";
    request_str += "'" + token + "')";

    let ret = this.doRequest(request_str, this.url, this.port);

    if (ret !== null && ret !== undefined)
      return ret;
    else
      return null;
  }

  arrayToString(array) {
    let result = "[";
    for (let i = 0; i < array.length; i++) {
      if (isPrimitive(array[i]))
        result += "'" + array[i] + "'";
      else
        result += this.arrayToString(array[i]);

      result += ",";
    }
    result = result.substr(0, result.length - 1);
    result += "]";
    return result;
  }

  stringToArray(str) {
    let nextPar = function (strstr) {
      for (let i = 0, cont = 0; i < strstr.length; i++) {
        let chrchr = strstr[i];
        if (chrchr === ']' && cont === 0)
          return i + 1;
        else if (chrchr === ']' && cont > 0)
          cont--;
        else if (chrchr === '[')
          cont++;
      }
    };

    let result = [];
    let cut_str = str.substr(1, str.length - 1); //extract the first '['

    for (let i = 0; i < cut_str.length; i++) {
      let chr = cut_str[i];
      if (chr !== ',') {
        if (chr === '[') {
          result.push(this.stringToArray(cut_str.substr(i, cut_str.length - i)));
          i += nextPar(cut_str.substr(i + 1, cut_str.length - i - 1));
        }
        else if (chr === ']')
          return result;
        else
          result.push(chr);
      }
    }
  }
};
