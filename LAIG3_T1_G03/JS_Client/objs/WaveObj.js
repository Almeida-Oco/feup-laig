/**
 * WaveObj
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
function WaveObj(scene, file) {
    CGFobject.call(this,scene);

    this.scene = scene;

    var rawFile = new XMLHttpRequest();
    var allText;

//    rawFile.get_obj_info = this.get_obj_info;
    rawFile.newParse = this.newParse;


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

    this.newParse(allText);
};

WaveObj.prototype = Object.create(CGFobject.prototype);
WaveObj.prototype.constructor=WaveObj;

WaveObj.prototype.get_obj_info = function (objText){

    console.log('Obj text is : ' + objText);

    var wave_obj = {};

    var obj_verticesPos = [];
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
            obj_verticesPos.push(vertices[0][i][j]);
            }
        }
    }

    wave_obj['vertices_pos'] = obj_verticesPos;


    obj_vtnormalsPos = [];
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
                obj_vtnormalsPos.push(normals[0][i][j]);
            }
        }
    }

    wave_obj['normals_pos'] = obj_vtnormalsPos;

    obj_vtTextCoordPos = [];
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
            obj_vtTextCoordPos.push(texCoords[0][i][j]);
            }
        }
    }

    wave_obj['textcoord_pos'] = obj_vtTextCoordPos;

    obj_allIndices = [];
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
        obj_allIndices = indices;
    }

    wave_obj['all_indices'] = obj_allIndices[0]; //faces


    wave_obj['vIndices'] = [];
    wave_obj['vTextIndices'] = [];
    wave_obj['vNormalIndices'] = [];


    for(let face_iter = 0; face_iter < wave_obj['all_indices'].length; face_iter++){
        let face = wave_obj['all_indices'][face_iter];
        for(let v_t_vn_iter = 0; v_t_vn_iter < face.length; v_t_vn_iter++){
            let v_t_vn = face[v_t_vn_iter];
            wave_obj['vIndices'].push( convertIndex(v_t_vn[0], wave_obj['all_indices'].length));
            wave_obj['vTextIndices'].push( convertIndex(v_t_vn[1], wave_obj['all_indices'].length));
            wave_obj['vNormalIndices'].push( convertIndex(v_t_vn[2], wave_obj['all_indices'].length));
        }
    }

/*
    alert('All Indices Vertices '  ); alert(wave_obj['vIndices']);
    alert('All Indices Text Coords '  ); alert(wave_obj['vTextIndices']);
    alert('All Indices Vertices Normals'  ); alert(wave_obj['vNormalIndices']);
*/

    return wave_obj;
}

WaveObj.prototype.cfg_from_wave = function(wave_obj){

    this.vertices = [];
    this.normals = [];
    this.texCoords = [];
    this.indices = [];

    for(let indice_iter = 0; indice_iter < wave_obj['vIndices'].length; indice_iter++){

        this.indices.push(indice_iter);

        this.vertices.push(wave_obj['vertices_pos'][wave_obj['vIndices'][indice_iter]]);
        this.texCoords.push(wave_obj['textcoord_pos'][wave_obj['vTextIndices'][indice_iter]]);
        this.normals.push(wave_obj['normals_pos'][wave_obj['vNormalIndices'][indice_iter]]);

    }



/*
   // this.vertices = wave_obj['vertices_pos'];
    //this.normals = wave_obj['normals_pos'];
    this.indices = wave_obj['vIndices'];
    //this.texCoords = wave_obj['textcoord_pos'];


    for(let indice_iter = 0; indice_iter < wave_obj['vIndices'].length; indice_iter++){

       // this.texCoords.push(wave_obj['vertices_pos'][wave_obj['vTextIndices'][indice_iter]]);
        //this.normals.push(wave_obj['normals_pos'][wave_obj['vNormalIndices'][indice_iter]]);
        //this.normals.push(wave_obj['normals_pos'][wave_obj['vNormalIndices'][indice_iter]]);

        this.vertices.push(wave_obj['vertices_pos'][wave_obj['vIndices'][indice_iter]]);
        this.texCoords.push(wave_obj['textcoord_pos'][wave_obj['vTextIndices'][indice_iter]]);
        this.normals.push(wave_obj['normals_pos'][wave_obj['vNormalIndices'][indice_iter]]);

    }
*/
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
}

function convertIndex(objIndex, arrayLength) {
    //return objIndex -1;
    return objIndex > 0 ? objIndex - 1 : objIndex + arrayLength;
}

WaveObj.prototype.newParse = function(string){

  var lines = string.split("\n");
   var positions = [];
   var textcoords = [];
   var normals = [];
   var vertices = [];

for ( var i = 0 ; i < lines.length ; i++ ) {
     var parts = lines[i].trimRight().split(' ');
     if ( parts.length > 0 ) {
       switch(parts[0]) {
         case 'v':  positions.push(
           vec3.fromValues(
             parseFloat(parts[1]),
             parseFloat(parts[2]),
             parseFloat(parts[3])
           ));
           break;
         case 'vt':
         textcoords.push(vec2.fromValues(
           parseFloat(parts[1]),
           parseFloat(parts[2]),
         ));
         break;
         case 'vn':
           normals.push(
             vec3.fromValues(
               parseFloat(parts[1]),
               parseFloat(parts[2]),
               parseFloat(parts[3])
           ));
           break;
         case 'f': {
           var f1 = parts[1].split('/');
           var f2 = parts[2].split('/');
           var f3 = parts[3].split('/');
           Array.prototype.push.apply(
             vertices, positions[parseInt(f1[0]) - 1]
           );
           Array.prototype.push.apply(
             vertices, normals[parseInt(f1[2]) - 1]
           );
           Array.prototype.push.apply(
             vertices, textcoords[parseInt(f1[1]) - 1]
           );
           Array.prototype.push.apply(
             vertices, positions[parseInt(f2[0]) - 1]
           );
           Array.prototype.push.apply(
             vertices, normals[parseInt(f2[2]) - 1]
           );
           Array.prototype.push.apply(
             vertices, textcoords[parseInt(f2[1]) - 1]
           );
           Array.prototype.push.apply(
             vertices, positions[parseInt(f3[0]) - 1]
           );
           Array.prototype.push.apply(
             vertices, normals[parseInt(f3[2]) - 1]
           );
           Array.prototype.push.apply(
             vertices, textcoords[parseInt(f3[1]) - 1]
           );
           break;
         }
       }
     }
   }

   var buffer = vertices;

    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

    for(let i = 0; i < buffer.length; i += 8) {
        this.vertices.push(buffer[i], buffer[i+1], buffer[i+2]);
        this.normals.push(buffer[i+3], buffer[i+4], buffer[i+5]);
        this.texCoords.push(buffer[i+6], buffer[i+7]);
    }
    for(let i = 0; i < this.vertices.length/3; i += 3)
        this.indices.push(i, i+1, i+2);


    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();




return vertices;
}


WaveObj.prototype.render = function(){
    this.display();
}





