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

    // while (this.doRequest("handshake") != "handshake");
    console.log("Server communication established!");
    this.scene = scene;
  }

  /**
   * Performs a request to the prolog server with the given string
   * @param request_str The string to send to the server
   * @return The reply of the server
   */
  doRequest(request_str) {
    let request = new XMLHttpRequest();
    request.open("GET", 'http://' + this.url + ':' + this.port + '/' + request_str, false);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(null);

    if (request.status === 200) {
      console.log("Reply ==== " + request.responseText);
      return request.responseText;
    }
    return null;
  }

  tryMove(board, table_n, seat_n, token) {
    let request_str = "turn(";
    request_str += this.arrayToString(board) + ",";
    request_str += table_n + ",";
    request_str += seat_n + ",";
    request_str += "'" + token + "')";

    let ret = this.doRequest(request_str);

    if (ret !== null && ret !== undefined)
      return this.stringToArray(ret);
    else
      return null;
  }

  validatePlay(Board, TableNumber, SeatNumber) {
    let request_str = "validPlay(";
    request_str += this.arrayToString(Board) + ",";
    request_str += TableNumber + ",";
    request_str += SeatNumber + ")";

    return this.doRequest(request_str);
  }

  nextAIPlay(Board, TableNumber) {
    let request_str = "aiNextPlay(";
    request_str += arrayToString(Board) + ",";
    request_str += TableNumber + ")";

    let reply = doRequest(request_str);
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

  plStartRequest(request_str) {
    console.log('Doing a Start Game Prolog Request with str: ' + request_str);

    var request = new XMLHttpRequest();

    request.comms = this;

    request.onload = function (data) {
      console.log("Start Request successful from PL server . Reply: " + data.target.response);
      this.comms.scene.initGame(data.target.response);
    };

    request.onerror = function () {
      console.log('ERROR on PL request');
    };

    request.open("GET", 'http://' + this.url + ':' + this.port + '/' + request_str, true);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

  }

  plGameStateRequest() {
    console.log('Doing a GetState Request');

    var request = new XMLHttpRequest();

    var answer;

    request.onload = function (data) {
      console.log("Get State ");
      answer = data.target.response;
    };

    request.onerror = function () {
      console.log('ERROR on PL request');
    };

    request.open("GET", 'http://' + this.url + ':' + this.port + '/gamestate', false);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

    return answer;

  }

  plSendMove(token, currTable, wantedSeat, board) {
    console.log('Doing a GetState Request');

    var request = new XMLHttpRequest();

    var answer;

    request.comms = this.scene;
    request.oldBoard = board;

    request.onload = function (data) {
      console.log("Got successful Send Move");
      if ('InvalidMove' != data.target.response) {
        answer = data.target.response;
        this.comms.gameState.setNewBoard(data.target.response, this.oldBoard);
      }
      else {
        this.comms.gameState.goBack(this.oldBoard);
      }
    };

    request.onerror = function () {
      console.log('ERROR on PL request');
      this.comms.gameState.goBack(this.oldBoard);
    };

    let request_url = 'playerMove(TeaToken, CurrTableNumber, WantedSeat, Board, NewBoard, NewTableNumber)';

    request_url = request_url.replace('TeaToken', token);
    request_url = request_url.replace('CurrTableNumber', currTable);
    request_url = request_url.replace('Board', board);
    request_url = request_url.replace('NewTableNumber', newTableNumber);
    request_url = request_url.replace('WantedSeat', wantedSeat);

    request.open("GET", 'http://' + this.url + ':' + this.port + '/' + request_url, false);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

    return answer;

  }
};
