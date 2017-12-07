/**
* MyPolygon
* @constructor
*/
function MyPolygon(scene, sides) {
    CGFobject.call(this,scene);
    this.sides = sides;
    this.initBuffers();
};

MyPolygon.prototype = Object.create(CGFobject.prototype);
MyPolygon.prototype.constructor = MyPolygon;

MyPolygon.prototype.initBuffers = function() {

    this.vertices = [
    ];

    this.indices = [
    ];

    this.normals = [
    ];

    this.texCoords = [
    ];

    var indice = 0;
    var angulo = Math.PI * 2 / this.sides;
    var x, y, z=0;

    this.vertices.push(0,0,0);
    this.normals.push(0,0,1);
    this.texCoords.push(0.5,0.5);

    for(var i = 0; i < this.sides; i++){
        this.texCoords.push(0.5*Math.cos(indice) + 0.5,0.5 - (0.5*Math.sin(indice)));

        x = 0.5*Math.cos(indice);
        y = 0.5*Math.sin(indice)
        this.vertices.push(x,y,z);
        this.normals.push(0,0,1);
        indice = angulo * (i + 1);
    }


    indice = 1;
    for(var i = 0; i < this.sides; i++){
        this.indices.push(0);
        if(i == (this.sides-1)){
            this.indices.push(indice);
            this.indices.push(1);
        }else{
            this.indices.push(indice);
            this.indices.push(indice + 1);
            indice = indice + 1;
        }
    }



    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
