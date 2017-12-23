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
Interface.prototype.init = function(application) {
  // call CGFinterface init
  CGFinterface.prototype.init.call(this, application);

  // init GUI. For more information on the methods, check:
  //  http://workshop.chromeexperiments.com/examples/gui

  this.gui = new dat.GUI();

  this.displayOutline = false;

  // add a group of controls (and open/expand by defult)

  return true;
};

/**
 * Adds a folder containing the IDs of the lights passed as parameter.
 */
Interface.prototype.addLightsGroup = function(lights) {

  var group = this.gui.addFolder("Lights");
  group.open();

  // add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
  // e.g. this.option1=true; this.option2=false;

  for (var key in lights) {
    if (lights.hasOwnProperty(key)) {
      this.scene.lightValues[key] = lights[key][0];
      group.add(this.scene.lightValues, key);
    }
  }
}


/**
 * Adds a folder containing the selection parameters such as color and the selectables themselves.
 */
Interface.prototype.addSelectables = function(scene, graph, nodes) {
  var sel_group = this.gui.addFolder("Selectables");
  sel_group.open();

  this.gui.add(graph, 'selected_node', graph.nodes_selectable).name('Selectables');


  this.params = {
    color: "#ff0000"
  };

  var sel_color = this.params;

  this.color = function() {
    scene.updateColor(sel_color.color);
  }
  sel_group.addColor(sel_color, 'color').onChange(this.color);

  scene.updateColor(sel_color.color);
}

Interface.prototype.addServerComs = function(server_coms) {

  var server_folder = this.gui.addFolder("Server");
  server_folder.open();

  server = server_coms;

  var obj = {
    ping: function() {
      console.log("Pinging PL Server");
      server.plRequest('handshake');
    }
  };

  this.gui.add(obj, 'ping');

}