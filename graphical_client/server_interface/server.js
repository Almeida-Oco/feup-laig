let isPrimitive = function (data) {
  return (data !== Object(data));
}

class ServerComs {
  constructor(port, url) {
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

  }

  doRequest(request_str) {
    let reply = null,
      request = new XMLHttpRequest();

    request.onload = function (data) {
      reply = data;
    }

    request.open("GET", 'http://' + this.url + ':' + this.port + '/' + request_str);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

    return reply;
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
        result += array[i];
      else
        result += arrayToString(array[i]);

      result += ",";
    }
    result.slice(0, result.length - 1);
    result += "]";
    return result;
  }
}
