//From https://github.com/EvanHahn/ScriptInclude
include = function () {
  function f() {
    var a = this.readyState;
    (!a || /ded|te/.test(a)) && (c--, !c && e && d())
  }
  var a = arguments,
    b = document,
    c = a.length,
    d = a[c - 1],
    e = d.call;
  e && c--;
  for (var g, h = 0; c > h; h++) g = b.createElement("script"), g.src = arguments[h], g.async = !0, g.onload = g.onerror = g.onreadystatechange = f, (b.head || b.getElementsByTagName("head")[0]).appendChild(g)
};
serialInclude = function (a) {
  var b = console,
    c = serialInclude.l;
  if (a.length > 0) c.splice(0, 0, a);
  else b.log("Done!");
  if (c.length > 0) {
    if (c[0].length > 1) {
      var d = c[0].splice(0, 1);
      b.log("Loading " + d + "...");
      include(d, function () {
        serialInclude([]);
      });
    }
    else {
      var e = c[0][0];
      c.splice(0, 1);
      e.call();
    };
  }
  else b.log("Finished.");
};
serialInclude.l = new Array();

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
  return vars;
}

serialInclude(['../lib/CGF.js',
  //ANIMATIONS
  'animations/Animation.js', 'animations/LinearAnimation.js', 'animations/CircularAnimation.js', 'animations/BezierAnimation.js', 'animations/ComboAnimation.js',

  //OBJECTS
  'objs/Triangle.js', 'objs/Sphere.js', 'objs/Quad.js', 'objs/Cylinder.js',
  'objs/Patch.js', 'objs/Circle.js', 'objs/oolong/GameState.js', 'objs/oolong/Seat.js',
	'objs/Cup.js',

  //Server
  'server_interface/server.js',

	//Game
	'game.js', 'strategy.js', 'aiStrategy.js', 'playerStrategy.js',
	'GraphLeaf.js', 'DynamicLeaf.js', 'StaticLeaf.js',

  'GraphParser.js', 'SceneGraph.js', 'XMLscene.js', 'GraphNode.js', 'Interface.js',

  main = function () {
    var app = new CGFapplication(document.body);
    var myInterface = new Interface();
    var myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

    // get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml
    // or use "demo.xml" as default (assumes files in subfolder "scenes", check SceneGraph constructor)

    var filename = getUrlVars()['file'] || "table.xml";

    // create and load graph, and associate it to scene.
    // Check console for loading errors
    var myGraph = new SceneGraph(myScene);
    myGraph.loadGraph(filename);

    // start
    app.run();
  }
]);
