class ServerComs {

  constructor(port, url, scene) {
    if (port == undefined) {
      this.port = 8081;
      console.log("Undefined port, defaulting to 8081");
    } else {
      this.port = port;
    }

    if (url == undefined) {
      this.url = 'localhost';
      console.log("Undefined url, defaulting to localhost");
    } else {
      this.url = url;
    }

    this.scene = scene;

  }

  plRequest(request_str) {
    console.log('Doing a Prolog Request with str: ' + request_str);

    var request = new XMLHttpRequest();

    request.onload = function(data) {
      console.log("Request successful from PL server . Reply: " + data.target.response);

    };

    request.onerror = function() {
      console.log('ERROR on PL request');
    };

    request.open("GET", 'http://' + this.url + ':' + this.port + '/' + request_str, true);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

  }

  plStartRequest(request_str) {
    console.log('Doing a Start Game Prolog Request with str: ' + request_str);

    var request = new XMLHttpRequest();

    request.comms = this;

    request.onload = function(data) {
      console.log("Start Request successful from PL server . Reply: " + data.target.response);
      this.comms.scene.initGame(data.target.response);
    };

    request.onerror = function() {
      console.log('ERROR on PL request');
    };

    request.open("GET", 'http://' + this.url + ':' + this.port + '/' + request_str, true);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

  }

  plGameStateRequest(){
    console.log('Doing a GetState Request');

    var request = new XMLHttpRequest();

    var answer;

    request.onload = function(data) {
      console.log("Get State ");
      answer = data.target.response;
    };

    request.onerror = function() {
      console.log('ERROR on PL request');
    };

    request.open("GET", 'http://' + this.url + ':' + this.port + '/gamestate' , false);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

    return answer;

  }

  plSendMove(token, currTable, wantedSeat, board){
    console.log('Doing a GetState Request');

    var request = new XMLHttpRequest();

    var answer;

    request.comms = this.scene;
    request.oldBoard = board;

    request.onload = function(data) {
      console.log("Got successful Send Move");
      if('InvalidMove' != data.target.response){
        answer = data.target.response;
        this.comms.gameState.setNewBoard(data.target.response, this.oldBoard);
      } else {
        this.comms.gameState.goBack(this.oldBoard);
      }
    };

    request.onerror = function() {
      console.log('ERROR on PL request');
      this.comms.gameState.goBack(this.oldBoard);
    };

    let request_url = 'playerMove(TeaToken, CurrTableNumber, WantedSeat, Board, NewBoard, NewTableNumber)';

    request_url = request_url.replace('TeaToken', token);
    request_url = request_url.replace('CurrTableNumber', currTable);
    request_url = request_url.replace('Board', board);
    request_url = request_url.replace('NewTableNumber', newTableNumber);
    request_url = request_url.replace('WantedSeat', wantedSeat);

    request.open("GET", 'http://' + this.url + ':' + this.port + '/' + request_url , false);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

    return answer;

  }


}