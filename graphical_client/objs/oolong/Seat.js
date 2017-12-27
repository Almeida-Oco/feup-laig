/**
 * Constructor of Seat
 * @param CGFScene scene The current scene
 * @param Array<int> transformation [x,y,z] dislocation of the seat
 * @constructor
 */
function Seat(scene, transformation) {
    CGFobject.call(this,scene);

    this.token = ' ';
    this.transformation = transformation;

    this.circle = Circle(scene, [25, 1]);
};

Seat.prototype = Object.create(CGFobject.prototype);
Seat.prototype.constructor = Seat;

Seat.prototype.render = function (afs, aft) {

    this.scene.pushMatrix();
        this.scene.translate(this.transformation[0], this.transformation[1], this.transformation[2]);
        this.circle.render(1,1);
    this.scene.popMatrix();

}

