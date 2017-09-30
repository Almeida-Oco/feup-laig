/**
* MySemiCircle
* @constructor
*/
function MySemiCircle(scene, sides) {
    CGFobject.call(this,scene);
		this.scene = scene;
		this.sides = sides;

		 this.initBuffers();
};

MySemiCircle.prototype = Object.create(CGFobject.prototype);
MySemiCircle.prototype.constructor = MySemiCircle;

MySemiCircle.prototype.initBuffers = function () {
	this.vertices = [0,0,0];
	this.indices = [];
	this.normals = [0,1,0];
	this.texCoords = [0.5,1];

	var angle_inc = Math.PI/(this.sides-1);
	for (i = 0 ; i < this.sides ; i++){
		this.vertices.push( Math.cos(angle_inc*i) , 0 , Math.sin(angle_inc*i) );
		this.texCoords.push ( (Math.cos(angle_inc*i)/2) + 0.5 , 1 - Math.sin(angle_inc*i)  );
		this.normals.push(0,1,0);
	}

	for (i = 0 ; i < this.sides ; i++){
		this.vertices.push( Math.cos(angle_inc*i) , 0 , Math.sin(angle_inc*i) );
		this.texCoords.push ( (Math.cos(angle_inc*i)/2) + 0.5 , 1 - Math.sin(angle_inc*i)  );
		this.normals.push(0,-1,0);
	}



	var i = 0;
	for(i = 1 ; i < this.sides ; i++)
		this.indices.push( i+1 , i , 0 );
	

	for(i ; i < (this.sides*2) ; i++)
		this.indices.push( i , i+1 , 0 );
	



	this.primitiveType = this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};
