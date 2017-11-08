/**
* @description Constructor of Sphere
* @param scene Scene to display sphere in
* @param args Array containing the following elements: [radius, slices, stacks]
*/
function Sphere(scene, args){
	this.radius = args[0];
	this.scene = scene;
	this.slices = parseFloat(args[1]);
	this.stacks = parseFloat(args[2]);
	this.minS = 0.0
	this.maxS = 1.0
	this.minT = 0.0
	this.maxT = 1.0
	this.texelLengthS = (this.maxS - this.minS) / this.slices;
	this.texelLengthT = (this.maxT - this.minT) / this.stacks;
	this.initBuffers();
};

Sphere.prototype = Object.create(CGFobject.prototype);
Sphere.prototype.constructor = Sphere;

/**
 * @description Initializes the arrays needed for rendering
 */
Sphere.prototype.initBuffers = function(){
	this.indices = [];
	this.normals = [];
	this.texCoords = [];
	this.vertices = [];

	var phi = 0;
	var sCoord = this.maxS;
	var phiIncrement = (2 * Math.PI) / this.slices;
	var thetaIncrement = Math.PI / this.stacks;

	for (var i = 0; i <= this.slices; i++)
	{
		var theta = 0;
		var tCoord = this.minT;

		for (var j = 0; j <= this.stacks; j++)
		{
			var x = this.radius*(Math.cos(phi) * Math.sin(theta));
			var z = this.radius*(Math.sin(phi) * Math.sin(theta));
			var y = this.radius*(Math.cos(theta));

			this.vertices.push(x, y, z);
			this.normals.push(x, y, z);
			this.texCoords.push(sCoord, tCoord);

			theta += thetaIncrement;
			tCoord += this.texelLengthT;
		}

		phi += phiIncrement;
		sCoord -= this.texelLengthS;
	}

	var vertexNumber = 1;

	for (var i = 0; i < this.slices; i++)
	{
		for (var j = 0; j < this.stacks; j++)
		{
			this.indices.push(vertexNumber, vertexNumber + this.stacks, vertexNumber + this.stacks + 1);
			this.indices.push(vertexNumber + this.stacks, vertexNumber, vertexNumber - 1);
			this.indices.push(vertexNumber + this.stacks + 1, vertexNumber + this.stacks, vertexNumber);
			this.indices.push(vertexNumber, vertexNumber + this.stacks, vertexNumber - 1);

			vertexNumber++;
		}

		vertexNumber++;
	}

	this.primitiveType = this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};

/**
 * @description Renders the primitive
 * @param afs Amplification factor in the X axis
 * @param aft Amplification factor in the Y axis
 */
Sphere.prototype.render = function(afs, aft){
	this.display();
}
