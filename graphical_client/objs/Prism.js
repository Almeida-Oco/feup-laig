/**
* MyPrism
* @constructor
*/
function MyPrism(scene, slices, stacks) {
  CGFobject.call(this,scene);

  this.slices = slices;
  this.stacks = stacks;

  this.initBuffers();
};

MyPrism.prototype = Object.create(CGFobject.prototype);
MyPrism.prototype.constructor = MyPrism;

MyPrism.prototype.initBuffers = function() {
  /*
  * TODO:
  * Replace the following lines in order to build a prism with a **single mesh**.
  *
  * How can the vertices, indices and normals arrays be defined to
  * build a prism with varying number of slices and stacks?
  */

  this.vertices = [
  ];

  this.indices = [
  ];

  this.normals = [
  ];

  this.texCoords = [
  ];

  var largura = 1;
  var altura = 1;
  var theta = Math.PI * 2 / this.slices;
  var angulo = 0;
  var indice = 0;
  var x, y, z;
  var inc_stack = altura / this.stacks;


  for( var stack = 0; stack < altura; stack+=inc_stack){

    for(var i = 0; i <= this.slices; i++){

      /*
      Método: desenhar face a face do prisma

      Calcular Vértices:

      Ex:
      V1 = ( cos(0) * largura, sin(0) * largura, altura )

            ____________ V2
           /           /|
          /_______V3_ / |
          |          |  |
          |          |  | V0
          |          | /
          |__________|/
                    V1

                    V1 está sobre os eixos xx e yy

      Calcular Normais:
      N1:
      x = cos(theta * i + (theta/2))
      y = sin(theta * i + (theta/2))
      z = 0

      */

      var n = theta * (i + 0.5);


      /*
      Vértice 0
      */
      x = Math.cos(angulo + theta) * largura ;
      y = Math.sin(angulo + theta) * largura;
      z = stack;
      this.vertices.push(x , y , z);
      this.texCoords.push(Math.cos(angulo+theta),1-z);

      /*
      Vertice 1
      */
      x = Math.cos(angulo) * largura;
      y = Math.sin(angulo) * largura;
      z = stack;
      this.vertices.push(x , y , z);
      this.texCoords.push(Math.cos(angulo),1-z);

      /*
      Vertice 2
      */
      x = Math.cos(angulo + theta) * largura;
      y = Math.sin(angulo + theta) * largura;
      z = (stack + inc_stack);
      this.vertices.push(x , y , z);
      this.texCoords.push(Math.cos(angulo+theta),1-z);

      /*
      Vertice 3
      */
      x = Math.cos(angulo) * largura;
      y = Math.sin(angulo) * largura;
      z = (stack + inc_stack);
      this.vertices.push(x , y , z);
      this.texCoords.push(Math.cos(angulo),1-z);


      /*
      Normais: são todas iguais para a mesma face
      */

      for (var cont = 0; cont < 4; cont++)
      {
        this.normals.push(Math.cos(n), Math.sin(n),0);

      }

      /*

            i3   __________ i2
                |       /  |
                |     /    |
                |   /      |
            i1  |/_________| i0

      */

      var i0 = indice;
      var i1 = indice + 1;
      var i2 = indice + 2;
      var i3 = indice + 3;

      this.indices.push(i2 , i1 , i0);
      this.indices.push(i1 , i2 , i3);


      angulo += theta; //rodar theta
      indice = indice + 4; // incrementar indices
    }

    angulo = 0; // iniciar novamente sobre o plano xOy
  }


  this.primitiveType = this.scene.gl.TRIANGLES;
  this.initGLBuffers();
};
