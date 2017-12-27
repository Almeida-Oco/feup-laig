/**
 * Interface class, creating a GUI interface.
 * @constructor
 */
function Interface() {
  //call CGFinterface constructor
  CGFinterface.call(this);
}


Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

/**
 * Initializes the interface.
 * @param {CGFapplication} application
 */
Interface.prototype.init = function (application) {
  // call CGFinterface init
  CGFinterface.prototype.init.call(this, application);

  // init GUI. For more information on the methods, check:
  //  http://workshop.chromeexperiments.com/examples/gui

  this.gui = new dat.GUI();

  this.displayOutline = false;

  // add a group of controls (and open/expand by defult)

  return true;
};

Interface.prototype.addServerComs = function (server_coms) {
  var server_folder = this.gui.addFolder("Server");
  server_folder.open();

  server = server_coms;

  var obj = {
    ping: function () {
      console.log("Pinging PL Server");
      server.plRequest('handshake');
    }
  };

  this.gui.add(obj, 'ping');

}
