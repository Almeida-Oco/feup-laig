/**
 * MyObject
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function MyObject(scene, file) {
    CGFobject.call(this,scene);

    //copied from https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
    var rawFile = new XMLHttpRequest();
    var allText;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);

    this.parse_obj(allText);
};

MyObject.prototype = Object.create(CGFobject.prototype);
MyObject.prototype.constructor=MyObject;


MyObject.prototype.parse_obj = function (objText) {

  this.vertices = [];
  var vertexMatches = objText.match(/^v( -?\d+(\.\d+)?){3}$/gm);
  if (vertexMatches)
  {
      vertices = []
      vertices.push(vertexMatches.map(function(vertex)
      {
          var vertices = vertex.split(" ");
          vertices.shift();
          return vertices;
      }));
      for(let i = 0; i < vertices[0].length;  i++){
        for(let j = 0; j < 3;  j++){
          this.vertices.push(vertices[0][i][j]);
        }
    }
  }

  this.normals = [];
  var vnormalMatches = objText.match(/^vn( -?\d+(\.\d+)?){3}$/gm);
  if (vnormalMatches)
  {
      normals = [];
      normals.push(vnormalMatches.map(function(normal)
      {
          var normals = normal.split(" ");
          normals.shift();
          return normals;
      }));
      for(let i = 0; i < normals[0].length;  i++){
        for(let j = 0; j < 3;  j++){
          this.normals.push(normals[0][i][j]);
        }
    }
  }

  this.texCoords = [];
  var textureMatches = objText.match(/^vt( -?\d+(\.\d+)?){2}$/gm);
  if (textureMatches)
  {
      texCoords = [];
      texCoords.push(textureMatches.map(function(texCoord)
      {
          var texCoords = texCoord.split(" ");
          texCoords.shift();
          return texCoords;
      }));
      for(let i = 0; i < texCoords[0].length;  i++){
        for(let j = 0; j < 2;  j++){
          this.texCoords.push(texCoords[0][i][j]);
        }
    }
  }

  this.indices = [];
  var faceMatches = objText.match(/^f( -?\d+[/]+\d+[/]+\d+){3}$/gm);
  if (faceMatches)
  {
      indices = [];
      indices.push(faceMatches.map(function(findice)
      {
          var indices = findice.split(" ");
          indices.shift();
          return indices.map(function(mixedIndice){
            return mixedIndice.split('/')[0];
          });
      }));
      for(let i = 0; i < indices[0].length;  i++){
        for(let j = 0; j < 3;  j++){
          this.indices.push(indices[0][i][j]-1);
        }
    }
  }

  this.primitiveType=this.scene.gl.TRIANGLES;
  this.initGLBuffers();

}

MyObject.prototype.render = function(){
	this.display();
}