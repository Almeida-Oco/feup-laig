class Strategy {

  constructor() {
    this.token = null;
    if (this.constructor === Strategy)
      throw new TypeError("Can't instantiate abstract class!");
    if (this.play === undefined)
      throw new TypeError("Classes inheriting from Strategy must implement play()");
  }

  setServerComs(server) {
    this.server = server;
  }

  setToken(token) {
    this.token = token;
  }
};
