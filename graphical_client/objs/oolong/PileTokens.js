/**
 * Constructor of PileTokens, used to make anim from and to
 * @param CGFScene scene The current scene
 * @param Array<int> transformation [x,y,z] dislocation of the seat
 * @constructor
 */
function PileTokens(scene, color) {
    CGFobject.call(this,scene);

    this.amount = 81;

    this.color = color;
    this.base_obj = Circle(scene, [25, 1]);
};

PileTokens.prototype = Object.create(CGFobject.prototype);
PileTokens.prototype.constructor = PileTokens;

PileTokens.prototype.render = function () {

/*
    this.scene.pushMatrix();
        this.scene.translate(this.transformation[0], this.transformation[1], this.transformation[2]);
        this.circle.render(1,1);
    this.scene.popMatrix();
*/

    for(let i = 0; i < this.numb; i+i){

    this.scene.pushMatrix();
        this.scene.translate(i*0.1, 0, 0);
        this.base_obj.render(1,1);
    this.scene.popMatrix();

    }

}


PileTokens.prototype.deacrease = function (numb) {

    if(numb == undefined){
        numb = 1;
    }

    this.amount -= numb;

}


