class ServerComs {

  constructor(port, url) {

    if(port == undefined){
        this.port = 8081;
        console.log("Undefined port, defaulting to 8081");
    } else {
        this.port = port;
    }

    if(url == undefined){
        this.url = 'localhost';
        console.log("Undefined url, defaulting to localhost");
    } else {
        this.url = url;
    }

  }

  plRequest(request_str) {

    console.log('Doing a Prolog Request with str: ' + request_str);

    var request = new XMLHttpRequest();

    request.onload = function(data){
        console.log("Request successful from PL server . Reply: " + data.target.response);
        //alert( data.target.response);
    };

    request.onerror = function(){
        console.log('ERROR on PL request');
    };

    request.open("GET", 'http://'+this.url+':'+this.port+'/'+request_str, true);

    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send();

  }
}
