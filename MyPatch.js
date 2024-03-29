/**
 * @description Constructor of MyPath
 * @param scene Scene to render patch in
 * @param args Array with following elements [partsU, partsV, orderU, orderV, controlV]
 */
function MyPatch(scene,args) {
		var degree1=args[0], degree2=args[1], parts_u=args[2], parts_v=args[3], control_vertexes=args[4];
		var knots1 = this.getKnotsVector(degree1);
		var knots2 = this.getKnotsVector(degree2);

		var points_list = [];
		for (var i = 0; i <= degree1 ; i++){
			var temp = [];
			for (var j = 0; j <= degree2; j++)
				temp.push(control_vertexes.shift());

			points_list.push(temp);
		}

		var nurbs_surface = new CGFnurbsSurface(degree1, degree2, knots1, knots2, points_list);
		getSurfacePoint = function(u, v) {
			return nurbs_surface.getPoint(u, v);
		};

		this.primitive = new CGFnurbsObject(scene, getSurfacePoint, parts_u, parts_v );
};

MyPatch.prototype = Object.create(CGFobject.prototype);
MyPatch.prototype.constructor=MyPatch;

/**
 * @description Renders the patch
 * @param afs Not needed in this primitive
 * @param aft Not needed in this primitive
 */
MyPatch.prototype.render = function(afs, aft){
	this.primitive.display();
}

/**
 * @description Returns the knots vector needed to render the patch
 * @param degree The degree of the knots vector to generate
 * @return The knots vector
 */
MyPatch.prototype.getKnotsVector = function(degree) {
	var v = new Array();
	for (var i=0; i<=degree; i++) {
		v.push(0);
	}
	for (var i=0; i<=degree; i++) {
		v.push(1);
	}
	return v;
}
