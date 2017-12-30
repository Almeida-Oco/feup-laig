












/*
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

  return([this.vertices, this.normals, this.texCoords, this.indices]);

}

/*
MyObject.prototype.initBuffers = function () {
  this.vertices = [
    this.x1, this.y1, 0,
    this.x1, this.y2, 0,
    this.x2, this.y1, 0,
    this.x2, this.y2, 0
  ];

  this.indices = [
    0, 1, 2,
    3, 2, 1
  ];

  this.normals = [
    this.x1, this.y1, 1,
    this.x1, this.y2, 1,
    this.x2, this.y1, 1,
    this.x2, this.y2, 1
  ];
  this.primitiveType=this.scene.gl.TRIANGLES;

};

MyObject.prototype.defTextCoords = function(afs, aft){
    var s = 1, t = 1;
    this.texCoords = [
        0, t,
        0, 0,
        s, t,
        s,0
    ];
    this.initGLBuffers();
}
*/

MyObject.prototype.render = function(){
    this.display();
}



MyObject.prototype.parse_obj2 =  function(str) {

  if(typeof buf !== 'string') {
    str = str.toString();
  }

  var lines = str.trim().split('\n');


  var positions = [];
  var cells = [];
  var vertexUVs = [];
  var vertexNormals = [];
  var faceUVs = [];
  var faceNormals = [];
  var name = null;

  for(var i=0; i<lines.length; i++) {
    var line = lines[i];

    if(line[0] === '#') continue;

    var parts = line
      .trim()
      .replace(/ +/g, ' ')
      .split(' ');

    switch(parts[0]) {
      case 'o':
        name = parts.slice(1).join(' ');
        break;
      case 'v':
        var position = parts.slice(1).map(Number).slice(0, 3);
        positions.push(position);
        break;
      case 'vt':
        var uv = parts.slice(1).map(Number);
        vertexUVs.push(uv);
        break;
      case 'vn':
        var normal = parts.slice(1).map(Number);
        vertexNormals.push(normal);
        break;
      case 'f':
        var positionIndices = [];
        var uvIndices = [];
        var normalIndices = [];

        parts
          .slice(1)
          .forEach(function(part) {
            var indices = part
              .split('/')
              .map(function(index) {
                if(index === '') {
                  return NaN;
                }
                return Number(index);
              })

            positionIndices.push(convertIndex(indices[0], positions.length));

            if(indices.length > 1) {
              if(!isNaN(indices[1])) {
                uvIndices.push(convertIndex(indices[1], vertexUVs.length));
              }
              if(!isNaN(indices[2])) {
                normalIndices.push(convertIndex(indices[2], vertexNormals.length));
              }
            }

          });

          cells.push(positionIndices);

          if(uvIndices.length > 0) {
            faceUVs.push(uvIndices);
          }
          if(normalIndices.length > 0) {
            faceNormals.push(normalIndices);
          }

        break;
      default:
        // skip
    }

  }

  this.vertices = positions;
  this.normals = vertexNormals;
  this.texCoords = vertexUVs;
  this.indices = positionIndices;

  this.primitiveType=this.scene.gl.TRIANGLES;
  this.initGLBuffers();

    return([this.vertices, this.normals, this.texCoords, this.indices]);
}

function convertIndex(objIndex, arrayLength) {
  return objIndex > 0 ? objIndex - 1 : objIndex + arrayLength;
}


MyObject.prototype.initBuffers = function (info) {

  var lines = info.split('\n');

  this.objects = [];

  var info = [];
  var objects = 0;
  var lastVerticeNmbr = 0;
  var vnumb = 0;

  for (line in lines) {
    var elements = lines[line].split(' ');
    if (elements[0] == 'o') {

      if (objects > 0) {
        var obj = new ObjObject(this.scene, info, lastVerticeNmbr, vnumb);
        this.objects.push(obj);
        lastVerticeNmbr += vnumb;
        vnumb = 0;
        info = [];
      }
      objects++;

    } else if (elements[0] == 'f' || elements[0] == 'v') {

      info.push(lines[line]);
      if (elements[0] == 'v') vnumb++;

    }

  }


  this.lines = info;
  this.vCount = lastVerticeNmbr;
  this.vNumb = vnumb;

  this.vertices = [];
  this.normals = [];
  this.indices = [];


  var repeated = 0;

  for (line in this.lines) {
    var elements = this.lines[line].split(' ');
    switch(elements[0]) {
      case 'v':
        this.vertices.push(parseFloat(elements[1]),
          parseFloat(elements[2]), parseFloat(elements[3]));
        break;
      case 'f':
        var v = [];
        v[0] = parseFloat(elements[1]) - 1 - this.vCount; v[1] = parseFloat(elements[2]) - 1 - this.vCount; v[2] =  parseFloat(elements[3]) - 1 - this.vCount;

        var p0 = []; p0[0] = this.vertices[v[0] * 3]; p0[1] = this.vertices[v[0] * 3 + 1]; p0[2] = this.vertices[v[0] * 3 + 2];
        var p1 = []; p1[0] = this.vertices[v[1] * 3]; p1[1] = this.vertices[v[1] * 3 + 1]; p1[2] = this.vertices[v[1] * 3 + 2];
        var p2 = []; p2[0] = this.vertices[v[2] * 3]; p2[1] = this.vertices[v[2] * 3 + 1]; p2[2] = this.vertices[v[2] * 3 + 2];

        var vec1 = vec3.fromValues(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
        var vec2 = vec3.fromValues(p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]);
        var normal = vec3.create();

        vec3.cross(normal, vec1, vec2);

        for (var i = 0; i < v.length; i++) {
          if (this.normals[v[i] * 3] != null) {
            this.vertices.push(this.vertices[v[i] * 3],
              this.vertices[v[i] * 3 + 1], this.vertices[v[i] * 3 + 2]);
            v[i] = this.vNumb + repeated;
            repeated++;
          }
          this.normals[v[i] * 3] = normal[0];
          this.normals[v[i] * 3 + 1] = normal[1];
          this.normals[v[i] * 3 + 2] = normal[2];
        }

        this.indices.push(v[0], v[1], v[2]);

        break;
    }
  }

  this.primitiveType=this.scene.gl.TRIANGLES;
  this.initGLBuffers();


}


MyObject.prototype.new_parse_obj = function (objText) {

    console.log(objText);

  this.possible_vertices = [];
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
          this.possible_vertices.push(vertices[0][i][j]);
        }
    }
  }

  this.possible_normals = [];
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
          this.possible_normals.push(normals[0][i][j]);
        }
    }
  }

  this.possible_texCoords = [];
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
          this.possible_texCoords.push(texCoords[0][i][j]);
        }
    }
  }


  this.possible_indices = [];
  this.possible_vertexNormal = [];
  this.possible_textCoord = [];
  var faceMatches = objText.match(/^f( -?\d+[/]+\d+[/]+\d+){3}$/gm);
  if (faceMatches)
  {
      indices = [];
      indices.push(faceMatches.map(function(findice)
      {
          var indices = findice.split(" ");
          indices.shift();
          return indices.map(function(mixedIndice){
            return mixedIndice.split('/');
          });
      }));
      alert(indices);
      /*
      for(let i = 0; i < indices[0].length;  i++){
        for(let j = 0; j < 3;  j++){
        //  this.indices.push(indices[0][i][j]-1);
          this.possible_indices.push(indices[0][i][j]);
          this.possible_vertexNormal.push(indices[1][i][j]);
          this.possible_textCoord.push(indices[2][i][j]);
        //  this.possible_indices.push(convertIndex(indices[0][i][j], this.vertices.length));
        }
    }*/

  }

  this.vertices = [];
  this.normals = [];
  this.texCoords = [];
  this.indices = [];

/*
  for(var k = 0; k < this.possible_indices.length; k++){


  }
  */
  let n = 0 ;
  for(pindice in this.possible_indices){
    var indice = convertIndex(pindice, this.possible_vertices.length);

    this.vertices.push(this.possible_vertices[indice]);
    this.normals.push(this.possible_vertexNormal[indice]);
    this.texCoords.push(this.possible_textCoord[indice]);
  //this.indices.push(this.possible_indices[indice]);
    this.indices.push(n);
  }

  this.primitiveType=this.scene.gl.TRIANGLES;
  this.initGLBuffers();

  return([this.vertices, this.normals, this.texCoords, this.indices]);

}

